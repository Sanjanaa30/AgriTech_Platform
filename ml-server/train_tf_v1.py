import os
import numpy as np
import pandas as pd
from pathlib import Path
import tensorflow as tf

# ===================== USER CONFIG =====================
PROCESSED_ROOT = Path("/home/sanjana/datasets/agritech_work/processed")
CROP = "tomato"  # or "rice"
IMG_SIZE = (160, 160)   # smaller to save memory
BATCH_SIZE = 16         # smaller batches
SEED = 42
EPOCHS = 15
# ======================================================

print("TensorFlow:", tf.__version__)
ROOT = PROCESSED_ROOT / CROP
MANIFEST = ROOT / "manifest.csv"

if not MANIFEST.exists():
    raise SystemExit(f"❌ Manifest not found: {MANIFEST}. Run prepare_v1.py first.")

# --- 1) Load manifest ---
df = pd.read_csv(MANIFEST)
print("\nManifest head:\n", df.head())

# Ensure consistent label order
class_names = ["Healthy", "Diseased"]
class_to_idx = {cls: i for i, cls in enumerate(class_names)}

# --- 2) Make TensorFlow datasets from manifest ---
def make_dataset(df_split, shuffle=True):
    paths = [str(ROOT / row.filepath.split(f"{CROP}/",1)[1]) for _, row in df_split.iterrows()]
    labels = [class_to_idx[row["class"]] for _, row in df_split.iterrows()]

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    def _load_img(path, label):
        img = tf.io.read_file(path)
        img = tf.io.decode_jpeg(img, channels=3)  # force RGB
        img = tf.image.resize(img, IMG_SIZE)
        img.set_shape((*IMG_SIZE, 3))             # enforce static shape
        return img, label

    ds = ds.map(_load_img, num_parallel_calls=tf.data.AUTOTUNE)
    if shuffle:
        ds = ds.shuffle(buffer_size=200, seed=SEED)  # smaller buffer
    # batch without prefetch (save RAM)
    ds = ds.batch(BATCH_SIZE, drop_remainder=True)
    return ds

train_df = df[df["split"] == "train"]
val_df   = df[df["split"] == "val"]
test_df  = df[df["split"] == "test"]

train_ds = make_dataset(train_df, shuffle=True)
val_ds   = make_dataset(val_df, shuffle=False)
test_ds  = make_dataset(test_df, shuffle=False)

print("\nCounts from manifest:")
print(train_df["class"].value_counts())
print(val_df["class"].value_counts())
print(test_df["class"].value_counts())

# --- 3) Compute class weights directly from manifest ---
n_healthy = (train_df["class"] == "Healthy").sum()
n_diseased = (train_df["class"] == "Diseased").sum()
total = n_healthy + n_diseased

w_healthy  = total / (2.0 * max(1, n_healthy))
w_diseased = total / (2.0 * max(1, n_diseased))
class_weight = {0: w_healthy, 1: w_diseased}

print("\nClass weights:", class_weight)

# --- 4) Data augmentation ---
data_augment = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.05),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomContrast(0.1),
], name="augment")

preprocess = tf.keras.applications.mobilenet_v2.preprocess_input

# --- 5) Model ---
base = tf.keras.applications.MobileNetV2(
    input_shape=(*IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)
base.trainable = False

inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
x = data_augment(inputs)
x = tf.keras.layers.Lambda(preprocess)(x)
x = base(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.2)(x)
outputs = tf.keras.layers.Dense(2, activation="softmax")(x)
model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=[tf.keras.metrics.SparseCategoricalAccuracy(name="acc")],
)

model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True, monitor="val_acc"),
    tf.keras.callbacks.ModelCheckpoint(
        filepath=str(ROOT / "best_model.keras"),
        monitor="val_acc",
        save_best_only=True
    ),
]

# --- 6) Train ---
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weight,
    callbacks=callbacks,
)

# --- 7) Evaluate ---
test_metrics = model.evaluate(test_ds, return_dict=True)
print("\nTest metrics:", test_metrics)

# --- 8) Confusion matrix + classification report ---
y_true, y_prob = [], []
for imgs, labels in test_ds:
    probs = model.predict(imgs, verbose=0)
    y_prob.append(probs)
    y_true.append(labels.numpy())

y_true = np.concatenate(y_true, axis=0)
y_prob = np.concatenate(y_prob, axis=0)
y_pred = np.argmax(y_prob, axis=1)

cm = tf.math.confusion_matrix(y_true, y_pred, num_classes=2).numpy()
print("\nConfusion matrix:\n", cm)

try:
    from sklearn.metrics import classification_report
    print("\nClassification report (Healthy=0, Diseased=1):")
    print(classification_report(y_true, y_pred, target_names=class_names, digits=4))
except Exception:
    print("\n(sklearn not available) Simple metrics only.")
