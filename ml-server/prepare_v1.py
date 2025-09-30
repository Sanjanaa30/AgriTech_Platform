import os
import csv
import shutil
from pathlib import Path
from typing import List, Tuple, Dict

from dotenv import load_dotenv

# Optional: use sklearn for stratified splitting if available
try:
    from sklearn.model_selection import train_test_split
    HAS_SK = True
except Exception:
    HAS_SK = False

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Paths
DATASET_ROOT = Path(os.getenv("DATASET_PATH", "")).resolve()
INTERIM_BASE = Path(os.getenv("INTERIM_PATH", str(DATASET_ROOT))).resolve()
PROCESSED_BASE = Path(os.getenv("PROCESSED_PATH", str(INTERIM_BASE))).resolve()

INTERIM_ROOT = INTERIM_BASE / "interim"
PROCESSED_ROOT = PROCESSED_BASE / "processed"

VALID_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
SEED = 42

def list_images(folder: Path) -> List[Path]:
    if not folder.exists(): return []
    return sorted([p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTS])

def collect_v1_pairs(crop: str) -> List[Tuple[Path, str]]:
    """
    Return list of (filepath, v1_label) from interim/<crop>.
    Healthy = 'healthy'. Everything else -> 'Diseased'.
    """
    crop_dir = INTERIM_ROOT / crop
    if not crop_dir.exists():
        raise SystemExit(f"❌ interim crop not found: {crop_dir}")

    pairs: List[Tuple[Path, str]] = []
    for cls_dir in sorted([d for d in crop_dir.iterdir() if d.is_dir()]):
        cls = cls_dir.name.strip().lower()
        label = "Healthy" if cls == "healthy" else "Diseased"
        for img in list_images(cls_dir):
            pairs.append((img, label))
    return pairs

def stratified_split(pairs: List[Tuple[Path, str]], seed: int = SEED):
    """
    Split into train/val/test = 70/20/10 with stratification.
    Uses sklearn if available; otherwise a simple manual stratifier.
    """
    X = [str(p) for p, _ in pairs]
    y = [lbl for _, lbl in pairs]

    if HAS_SK:
        # First: train vs temp (val+test = 30%)
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.30, random_state=seed, stratify=y
        )
        # Split temp into val (20%) and test (10%) -> val:test = 2:1 of temp
        rel_test = 1.0 / 3.0
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=rel_test, random_state=seed, stratify=y_temp
        )
        return (X_train, y_train), (X_val, y_val), (X_test, y_test)

    # Fallback manual stratifier: per-class slicing
    from collections import defaultdict
    by_class: Dict[str, List[str]] = defaultdict(list)
    for path, lbl in zip(X, y):
        by_class[lbl].append(path)
    # deterministic order
    for lbl in by_class:
        by_class[lbl].sort()

    Xtr, Ytr, Xv, Yv, Xte, Yte = [], [], [], [], [], []
    for lbl, paths in by_class.items():
        n = len(paths)
        n_test = max(1, int(round(n * 0.10)))
        n_val  = max(1, int(round(n * 0.20)))
        n_train = max(1, n - n_val - n_test)
        # simple deterministic slices
        tr = paths[:n_train]
        va = paths[n_train:n_train+n_val]
        te = paths[n_train+n_val:n_train+n_val+n_test]
        Xtr += tr; Ytr += [lbl]*len(tr)
        Xv  += va; Yv  += [lbl]*len(va)
        Xte += te; Yte += [lbl]*len(te)
    return (Xtr, Ytr), (Xv, Yv), (Xte, Yte)

def copy_to_processed(crop: str, split_name: str, xs: List[str], ys: List[str]) -> List[Tuple[str, str, str, str]]:
    """
    Copy files into processed/<crop>/<split>/<Label>/ and return manifest rows:
    (filepath_rel, class, split, crop)
    """
    rows = []
    root = PROCESSED_ROOT / crop / split_name
    (root / "Healthy").mkdir(parents=True, exist_ok=True)
    (root / "Diseased").mkdir(parents=True, exist_ok=True)

    for src, lbl in zip(xs, ys):
        srcp = Path(src)
        dst_folder = root / lbl
        dst_folder.mkdir(parents=True, exist_ok=True)
        dst = dst_folder / srcp.name  # keep cleaned filename
        shutil.copy2(srcp, dst)
        rel = f"{crop}/{split_name}/{lbl}/{dst.name}"
        rows.append((rel, lbl, split_name, crop))
    return rows

def counts_by(labels: List[str]) -> Dict[str, int]:
    from collections import Counter
    return dict(Counter(labels))

def main(crop: str):
    crop = crop.strip().lower()
    print(f"Project: {PROJECT_ROOT}")
    print(f"Interim root: {INTERIM_ROOT}")
    print(f"Processed root: {PROCESSED_ROOT}")
    print(f"Crop: {crop}")

    pairs = collect_v1_pairs(crop)
    if not pairs:
        raise SystemExit("❌ No images found in interim. Run cleaning first.")

    # Split
    (Xtr, Ytr), (Xv, Yv), (Xte, Yte) = stratified_split(pairs, seed=SEED)

    # Sanity (before copying)
    print("\nSanity (pre-copy):")
    print(" Train:", counts_by(Ytr))
    print(" Val  :", counts_by(Yv))
    print(" Test :", counts_by(Yte))

    # Copy to processed
    rows = []
    rows += copy_to_processed(crop, "train", Xtr, Ytr)
    rows += copy_to_processed(crop, "val",   Xv,  Yv)
    rows += copy_to_processed(crop, "test",  Xte, Yte)

    # Write manifest
    manifest = PROCESSED_ROOT / crop / "manifest.csv"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest, "w", newline="", encoding="utf-8") as fp:
        w = csv.writer(fp)
        w.writerow(["filepath", "class", "split", "crop"])
        w.writerows(rows)

    # Final sanity from the filesystem (post-copy)
    def count_dir(d: Path): return len([p for p in d.glob("*/*/*") if p.is_file()])
    final_counts = {
        "train": count_dir(PROCESSED_ROOT / crop / "train"),
        "val":   count_dir(PROCESSED_ROOT / crop / "val"),
        "test":  count_dir(PROCESSED_ROOT / crop / "test"),
    }

    print("\n✅ Done")
    print(f" Manifest: {manifest}")
    print(" Final counts (files):", final_counts)
    print(" Check:", PROCESSED_ROOT / crop)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Collapse to v1 labels and split into train/val/test.")
    parser.add_argument("--crop", required=True, help="e.g., tomato, rice")
    args = parser.parse_args()
    main(args.crop)
