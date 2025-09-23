import os
import uuid
import csv
import shutil
from pathlib import Path
from typing import Optional, Dict, Tuple

from dotenv import load_dotenv

# Pillow + imagehash for robust image handling & near-dup detection
from PIL import Image, ImageOps, UnidentifiedImageError
try:
    import imagehash  # pip install ImageHash
except ImportError:
    imagehash = None

# Optional: OpenCV for blur detection (variance of Laplacian)
try:
    import cv2  # pip install opencv-python
except ImportError:
    cv2 = None

# ---------------- Config (tweak thresholds here) ----------------
MIN_SIDE = 256         # reject if min(width, height) < MIN_SIDE
ASPECT_MIN = 0.5       # reject if (w/h) < 0.5
ASPECT_MAX = 2.0       # reject if (w/h) > 2.0
BLUR_VAR_MIN = 80.0    # reject if Laplacian variance < BLUR_VAR_MIN (if OpenCV available)
PHASH_CUTOFF = 5       # near-duplicate if Hamming distance <= PHASH_CUTOFF (if imagehash available)

# ---------------- Resolve paths/env ----------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
DOCS_DIR = PROJECT_ROOT / "docs"
load_dotenv(dotenv_path=ENV_PATH)

DATASET_ROOT = Path(os.getenv("DATASET_PATH", "")).resolve()
RAW_ROOT = DATASET_ROOT / "raw"
# NEW: allow writing interim somewhere else (Linux home) to avoid Windows perms
INTERIM_BASE = Path(os.getenv("INTERIM_PATH", str(DATASET_ROOT))).resolve()
INTERIM_ROOT = INTERIM_BASE / "interim"

VALID_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
SKIP_NAMES = {"Thumbs.db", ".DS_Store"}

# ---------------- Helpers ----------------
def ensure_dirs(*paths: Path):
    for p in paths:
        p.mkdir(parents=True, exist_ok=True)

def to_rgb_autoorient(img: Image.Image) -> Image.Image:
    # Auto-orient by EXIF then convert to RGB
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img

def blur_variance(pil_img: Image.Image) -> Optional[float]:
    if cv2 is None:
        return None
    try:
        arr = cv2.cvtColor(
            cv2.imdecode(
                # Fast path: convert PIL -> bytes -> OpenCV array
                # but simplest is to convert to numpy array directly
                # However, Pillow to numpy is straightforward:
                # np.asarray(pil_img) gives RGB array, then cvtColor to GRAY
                # We'll do that simpler:
                None,  # placeholder, we won't use imdecode here
                cv2.IMREAD_GRAYSCALE
            ), cv2.COLOR_BGR2GRAY
        )
    except Exception:
        # simpler approach:
        import numpy as np
        arr = np.asarray(pil_img)
        if arr.ndim == 3:
            arr = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        elif arr.ndim == 2:
            pass
        else:
            return None
    return cv2.Laplacian(arr, cv2.CV_64F).var()

def compute_phash(pil_img: Image.Image) -> Optional[str]:
    if imagehash is None:
        return None
    return str(imagehash.phash(pil_img))

def hamming(a: str, b: str) -> int:
    # imagehash strings are hex; imagehash lib compares directly, but we’ll be simple:
    # Use imagehash library distance if available; else fallback hex->bin distance
    if imagehash is not None:
        return imagehash.hex_to_hash(a) - imagehash.hex_to_hash(b)
    # Fallback (rough): compare hex chars
    return sum(ch1 != ch2 for ch1, ch2 in zip(a, b))

def accept_or_reason(pil_img: Image.Image) -> Tuple[bool, str, Dict[str, float]]:
    """
    Returns (ok: bool, reason: str, meta: dict).
    Always returns a tuple; never None.
    """
    w, h = pil_img.size
    meta: Dict[str, float] = {"width": float(w), "height": float(h)}

    # Min side check
    if min(w, h) < MIN_SIDE:
        return False, "too_small", meta

    # Aspect ratio check
    ar = (w / h) if h else 0.0
    meta["aspect_ratio"] = float(ar)
    if ar < ASPECT_MIN or ar > ASPECT_MAX:
        return False, "bad_aspect_ratio", meta

    # NOTE: Blur check now handled optionally from caller; keep this function simple/fast
    return True, "ok", meta

def clean_crop(crop: str, dry_run: bool = False):
    src_crop = RAW_ROOT / crop
    dst_crop = INTERIM_ROOT / crop
    rejects_root = INTERIM_ROOT / "_rejects"

    ensure_dirs(dst_crop, rejects_root)

    # Per-class duplicate memory (phash -> first path)
    phash_memory: Dict[str, Dict[str, str]] = {}  # class_name -> {hash -> filename}

    index_rows = []
    total_ok = total_reject = 0

    class_dirs = [d for d in src_crop.iterdir() if d.is_dir()]
    # put healthy first for readability
    class_dirs.sort(key=lambda p: (p.name != "healthy", p.name))

    for cls_dir in class_dirs:
        cls = cls_dir.name
        dst_cls = dst_crop / cls
        rej_cls = rejects_root / cls
        ensure_dirs(dst_cls, rej_cls)

        phash_memory.setdefault(cls, {})

        for f in cls_dir.iterdir():
            if not f.is_file() or f.name in SKIP_NAMES or f.suffix.lower() not in VALID_EXTS:
                continue

            # Load & normalize
            try:
                with Image.open(f) as im:
                    im = to_rgb_autoorient(im)
            except (UnidentifiedImageError, OSError):
                # corrupt/unreadable
                reason = "corrupt"
                total_reject += 1
                if not dry_run:
                    shutil.copy2(f, rej_cls / f.name)
                index_rows.append([crop, cls, str(f), "", reason, "", "", "", ""])
                continue

            # Quality checks
            ok, reason, meta = accept_or_reason(im)
            # Duplicate check
            ph: Optional[str] = compute_phash(im)

            # If OK so far and we have a phash, check near duplicates within same class
            if ok and ph is not None:
                dup_found = False
                for existing_ph, _path in phash_memory[cls].items():
                    if hamming(ph, existing_ph) <= PHASH_CUTOFF:
                        ok = False
                        reason = "near_duplicate"
                        dup_found = True
                        break
                if not dup_found:
                    phash_memory[cls][ph] = f.name

            if ok:
                total_ok += 1
                # Standardize filename to avoid collisions
                new_name = f"{cls}_{uuid.uuid4().hex}.jpg"
                dst_path = dst_cls / new_name
                if not dry_run:
                    # save as high-quality jpeg
                    im.save(dst_path, format="JPEG", quality=92, optimize=True)
                index_rows.append([
                    crop, cls, str(f), str(dst_path), "ok",
                    meta.get("width", ""), meta.get("height", ""),
                    meta.get("aspect_ratio", ""), meta.get("blur_var", "")
                ])
            else:
                total_reject += 1
                if not dry_run:
                    shutil.copy2(f, rej_cls / f.name)
                index_rows.append([
                    crop, cls, str(f), "", reason,
                    meta.get("width", ""), meta.get("height", ""),
                    meta.get("aspect_ratio", ""), meta.get("blur_var", "")
                ])

    # write index CSV
    out_csv = INTERIM_ROOT / crop / "_clean_index.csv"
    ensure_dirs(out_csv.parent)
    with open(out_csv, "w", newline="", encoding="utf-8") as fp:
        w = csv.writer(fp)
        w.writerow(["crop", "class", "src_path", "dst_path", "status_or_reason",
                    "width", "height", "aspect_ratio", "blur_var"])
        w.writerows(index_rows)

    print(f"\n✅ Cleaned '{crop}': kept={total_ok}, rejected={total_reject}")
    print(f"   Index: {out_csv}")
    print(f"   Output: {INTERIM_ROOT / crop}")
    print(f"   Rejects: {INTERIM_ROOT / '_rejects'}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Clean crop images from raw/ to interim/")
    parser.add_argument("--crop", required=True, help="e.g., rice, tomato")
    parser.add_argument("--dry-run", action="store_true", help="Process but do not write outputs")
    parser.add_argument("--with-blur", action="store_true",
                        help="Enable blur detection (slower; needs OpenCV)")
    parser.add_argument("--no-dupes", action="store_true",
                        help="Disable near-duplicate removal (phash)")

    args = parser.parse_args()
    crop = args.crop.strip().lower()
    src = RAW_ROOT / crop
    if not src.exists():
        raise SystemExit(f"❌ raw crop folder not found: {src}")

    # Show config summary
    print("Project root:", PROJECT_ROOT)
    print("Dataset root:", DATASET_ROOT)
    print("RAW:", RAW_ROOT)
    print("INTERIM:", INTERIM_ROOT)
    print(f"Crop: {crop}")
    print(f"Thresholds: MIN_SIDE={MIN_SIDE}, AR=({ASPECT_MIN}, {ASPECT_MAX})")
    print(f"Blur check: {'ON' if args.with_blur and cv2 is not None else 'OFF'} "
          f"({('OpenCV not installed' if cv2 is None else 'cv2 available')})")
    print(f"Near-duplicates: {'OFF' if args.no_dupes else 'ON'} "
          f"({('ImageHash not installed' if imagehash is None else 'ImageHash available')})")

    # Inject runtime toggles into global state via closures (simple approach):
    USE_BLUR = bool(args.with_blur and cv2 is not None)
    USE_DUPES = not args.no_dupes and (imagehash is not None)

    # Wrap original helpers with toggles
    def maybe_blur_reject(pil_img):
        """Return (ok, reason, meta) or (None,None,None) if not applying blur."""
        if not USE_BLUR:
            return None, None, None
        try:
            import numpy as np
            arr = np.asarray(pil_img)
            if arr.ndim == 3:
                gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
            else:
                gray = arr
            bv = cv2.Laplacian(gray, cv2.CV_64F).var()
            if bv < BLUR_VAR_MIN:
                return False, "blurry", {"blur_var": float(bv)}
            return True, "ok", {"blur_var": float(bv)}
        except Exception:
            # If blur computation fails, just skip blur without rejecting
            return None, None, None

    # Patch clean_crop to reference toggles without heavy refactor:
    original_clean_crop = clean_crop
    def clean_crop_with_toggles(crop: str, dry_run: bool = False):
        src_crop = RAW_ROOT / crop
        dst_crop = INTERIM_ROOT / crop
        rejects_root = INTERIM_ROOT / "_rejects"

        ensure_dirs(dst_crop, rejects_root)

        phash_memory: Dict[str, Dict[str, str]] = {}

        index_rows = []
        total_ok = total_reject = 0

        class_dirs = [d for d in src_crop.iterdir() if d.is_dir()]
        class_dirs.sort(key=lambda p: (p.name != "healthy", p.name))

        for cls_dir in class_dirs:
            cls = cls_dir.name
            dst_cls = dst_crop / cls
            rej_cls = rejects_root / cls
            ensure_dirs(dst_cls, rej_cls)

            phash_memory.setdefault(cls, {})

            for f in cls_dir.iterdir():
                if not f.is_file() or f.name in SKIP_NAMES or f.suffix.lower() not in VALID_EXTS:
                    continue
                try:
                    with Image.open(f) as im:
                        im = ImageOps.exif_transpose(im)
                        if im.mode != "RGB":
                            im = im.convert("RGB")
                except (UnidentifiedImageError, OSError):
                    reason = "corrupt"
                    total_reject += 1
                    if not dry_run:
                        shutil.copy2(f, rej_cls / f.name)
                    index_rows.append([crop, cls, str(f), "", reason, "", "", "", ""])
                    continue

                # Base checks (size/aspect)
                ok, reason, meta = accept_or_reason(im)

                # Optional blur check
                if ok:
                    b_ok, b_reason, b_meta = maybe_blur_reject(im)
                    if b_ok is False:  # explicit reject by blur
                        ok, reason = False, b_reason
                        meta.update(b_meta or {})

                # Optional near-duplicate check
                ph = None
                if ok and USE_DUPES:
                    try:
                        ph = str(imagehash.phash(im))
                        # check within class
                        dup_found = False
                        for existing_ph, _path in phash_memory[cls].items():
                            if (imagehash.hex_to_hash(ph) - imagehash.hex_to_hash(existing_ph)) <= PHASH_CUTOFF:
                                ok = False
                                reason = "near_duplicate"
                                dup_found = True
                                break
                        if not dup_found:
                            phash_memory[cls][ph] = f.name
                    except Exception:
                        # if hashing fails, just skip dupe logic
                        pass

                if ok:
                    total_ok += 1
                    new_name = f"{cls}_{uuid.uuid4().hex}.jpg"
                    dst_path = dst_cls / new_name
                    if not dry_run:
                        im.save(dst_path, format="JPEG", quality=92, optimize=True)
                    index_rows.append([
                        crop, cls, str(f), str(dst_path), "ok",
                        meta.get("width", ""), meta.get("height", ""),
                        meta.get("aspect_ratio", ""), meta.get("blur_var", "")
                    ])
                else:
                    total_reject += 1
                    if not dry_run:
                        shutil.copy2(f, rej_cls / f.name)
                    index_rows.append([
                        crop, cls, str(f), "", reason,
                        meta.get("width", ""), meta.get("height", ""),
                        meta.get("aspect_ratio", ""), meta.get("blur_var", "")
                    ])

        out_csv = INTERIM_ROOT / crop / "_clean_index.csv"
        ensure_dirs(out_csv.parent)
        with open(out_csv, "w", newline="", encoding="utf-8") as fp:
            w = csv.writer(fp)
            w.writerow(["crop", "class", "src_path", "dst_path", "status_or_reason",
                        "width", "height", "aspect_ratio", "blur_var"])
            w.writerows(index_rows)

        print(f"\n✅ Cleaned '{crop}': kept={total_ok}, rejected={total_reject}")
        print(f"   Index: {out_csv}")
        print(f"   Output: {INTERIM_ROOT / crop}")
        print(f"   Rejects: {INTERIM_ROOT / '_rejects'}")

    # Run with toggles
    clean_crop_with_toggles(crop, dry_run=args.dry_run)
