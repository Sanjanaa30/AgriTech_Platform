# import os
# from pathlib import Path
# from dotenv import load_dotenv

# # ---------- Setup & config ----------
# # Resolve project root (assumes this file is in <project>/ml-server/)
# PROJECT_ROOT = Path(__file__).resolve().parents[1]
# ENV_PATH = PROJECT_ROOT / ".env"
# DOCS_DIR = PROJECT_ROOT / "docs"

# # Load .env from the project root explicitly (more reliable than cwd search)
# load_dotenv(dotenv_path=ENV_PATH)

# # Get dataset path (e.g., /mnt/d/datasets/agritech)
# dataset_root = Path(os.getenv("DATASET_PATH", "")).resolve()
# raw_path = dataset_root / "raw"

# VALID_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
# SKIP_FILENAMES = {"Thumbs.db", ".DS_Store"}

# print("Project root:", PROJECT_ROOT)
# print("Using .env at:", ENV_PATH)
# print("Dataset root:", dataset_root)
# print("Raw datasets path:", raw_path)
# print("Exists?", raw_path.exists())

# def nice_name(s: str) -> str:
#     """Convert 'early_blight' -> 'Early Blight'."""
#     return s.replace("_", " ").strip().title()

# def count_images(folder: Path) -> int:
#     """Count only valid image files directly under folder (non-recursive)."""
#     count = 0
#     for f in folder.iterdir():
#         if f.is_file():
#             if f.name in SKIP_FILENAMES:
#                 continue
#             if f.suffix.lower() in VALID_IMAGE_EXTS:
#                 count += 1
#     return count

# # --- Dataset Audit ---
# def audit_crop(crop_path: Path):
#     """
#     Count images in each class folder of one crop.
#     Returns list of tuples: (class_name_raw, count)
#     """
#     summary = []
#     if not crop_path.exists():
#         print(f"❌ Path not found: {crop_path}")
#         return summary

#     print(f"\n📊 Auditing {crop_path.name}")
#     print("=" * 40)

#     # Ensure consistent class order: Healthy first (if exists), then alphabetically
#     class_dirs = [d for d in crop_path.iterdir() if d.is_dir()]
#     class_dirs.sort(key=lambda p: (p.name != "healthy", p.name))

#     total = 0
#     for cls_dir in class_dirs:
#         cnt = count_images(cls_dir)
#         total += cnt
#         print(f"{cls_dir.name:<20} {cnt:>6} images")
#         summary.append((cls_dir.name, cnt))

#     print("-" * 40)
#     print(f"{'TOTAL':<20} {total:>6} images")
#     return summary

# def audit_all_crops(raw_root: Path):
#     """Loop over all crops in raw/ and audit them. Returns dict[crop] = [(class,count), ...]."""
#     results = {}
#     if not raw_root.exists():
#         print(f"❌ Raw path not found: {raw_root}")
#         return results

#     # Only include directories (e.g., rice/, tomato/)
#     crops = [d for d in raw_root.iterdir() if d.is_dir()]
#     crops.sort(key=lambda p: p.name)

#     for crop in crops:
#         results[crop.name] = audit_crop(crop)
#     return results

# # Run audit
# all_results = audit_all_crops(raw_path)

# # --- Save to docs/data_audit.md ---
# DOCS_DIR.mkdir(exist_ok=True)
# audit_file = DOCS_DIR / "data_audit.md"

# with open(audit_file, "w", encoding="utf-8") as f:
#     f.write("# Dataset Audit\n\n")
#     for crop, classes in all_results.items():
#         # Compute crop total
#         crop_total = sum(cnt for _, cnt in classes)
#         f.write(f"## {nice_name(crop)} Dataset\n\n")
#         for cls, count in classes:
#             f.write(f"- **{nice_name(cls)}**: {count} images\n")
#         f.write(f"\n**Total**: {crop_total} images\n\n")

# print(f"\n✅ Audit results saved to {audit_file}")

import os
import csv
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

from dotenv import load_dotenv

# ---------- Setup & config ----------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
DOCS_DIR = PROJECT_ROOT / "docs"

load_dotenv(dotenv_path=ENV_PATH)

# Paths
DATASET_ROOT = Path(os.getenv("DATASET_PATH", "")).resolve()
RAW_ROOT = DATASET_ROOT / "raw"

# Allow interim to live elsewhere (Linux home), falls back to DATASET_ROOT
INTERIM_BASE = Path(os.getenv("INTERIM_PATH", str(DATASET_ROOT))).resolve()
INTERIM_ROOT = INTERIM_BASE / "interim"

VALID_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
SKIP_FILENAMES = {"Thumbs.db", ".DS_Store"}

print("Project root:", PROJECT_ROOT)
print("Using .env at:", ENV_PATH)
print("RAW root:", RAW_ROOT, "exists:", RAW_ROOT.exists())
print("INTERIM root:", INTERIM_ROOT, "exists:", INTERIM_ROOT.exists())

# ---------- Helpers ----------
def nice_name(s: str) -> str:
    return s.replace("_", " ").strip().title()

def count_images(folder: Path) -> int:
    """Count only valid image files directly under folder (non-recursive)."""
    if not folder.exists():
        return 0
    count = 0
    for f in folder.iterdir():
        if f.is_file() and f.name not in SKIP_FILENAMES and f.suffix.lower() in VALID_IMAGE_EXTS:
            count += 1
    return count

def audit_split(root_crop_path: Path) -> List[Tuple[str, int]]:
    """
    Count images per class folder under a crop root (non-recursive).
    Returns: [(class_name, count), ...] with Healthy first then alphabetical.
    """
    summary: List[Tuple[str, int]] = []
    if not root_crop_path.exists():
        return summary

    class_dirs = [d for d in root_crop_path.iterdir() if d.is_dir()]
    class_dirs.sort(key=lambda p: (p.name != "healthy", p.name))

    for cls_dir in class_dirs:
        summary.append((cls_dir.name, count_images(cls_dir)))
    return summary

def read_rejects_from_csv(crop: str) -> Dict[str, Dict[str, int]]:
    """
    Read rejects summary from interim/<crop>/_clean_index.csv if present.
    Returns: {class: {reason: count, ...}, ...}
    """
    out: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    csv_path = INTERIM_ROOT / crop / "_clean_index.csv"
    if not csv_path.exists():
        return {}

    # columns: crop,class,src_path,dst_path,status_or_reason,width,height,aspect_ratio,blur_var
    try:
        with open(csv_path, "r", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                cls = row.get("class", "").strip()
                status = (row.get("status_or_reason", "") or "").strip()
                dst = (row.get("dst_path", "") or "").strip()
                if status and status != "ok":
                    out[cls][status] += 1
    except Exception:
        return {}
    return out

def audit_crop_pair(crop: str) -> Dict[str, any]:
    """Audit one crop in both raw and interim (if exists)."""
    raw_classes = audit_split(RAW_ROOT / crop)
    interim_classes = audit_split(INTERIM_ROOT / crop)

    raw_total = sum(c for _, c in raw_classes)
    interim_total = sum(c for _, c in interim_classes)

    rejects_by_reason = read_rejects_from_csv(crop)  # per-class breakdown

    return {
        "crop": crop,
        "raw": raw_classes,
        "raw_total": raw_total,
        "interim": interim_classes,
        "interim_total": interim_total,
        "rejects_by_reason": rejects_by_reason,
    }

# ---------- Main audit ----------
# Build the union of crop names present in raw/ and interim/
crops = set()
if RAW_ROOT.exists():
    crops.update([d.name for d in RAW_ROOT.iterdir() if d.is_dir()])
if INTERIM_ROOT.exists():
    crops.update([d.name for d in INTERIM_ROOT.iterdir() if d.is_dir()])

crops = sorted(crops)

results = [audit_crop_pair(c) for c in crops]

# ---------- Write report ----------
DOCS_DIR.mkdir(exist_ok=True)
audit_file = DOCS_DIR / "data_audit.md"

with open(audit_file, "w", encoding="utf-8") as f:
    f.write("# Dataset Audit\n\n")
    f.write(f"- **RAW root**: `{RAW_ROOT}`\n")
    f.write(f"- **INTERIM root**: `{INTERIM_ROOT}`\n\n")

    for r in results:
        crop = r["crop"]
        f.write(f"## {nice_name(crop)}\n\n")

        # RAW
        f.write("### Raw\n")
        if r["raw"]:
            for cls, cnt in r["raw"]:
                f.write(f"- **{nice_name(cls)}**: {cnt} images\n")
            f.write(f"\n**Total (raw)**: {r['raw_total']} images\n\n")
        else:
            f.write("_No raw data found._\n\n")

        # INTERIM
        f.write("### Interim (cleaned)\n")
        if r["interim"]:
            for cls, cnt in r["interim"]:
                f.write(f"- **{nice_name(cls)}**: {cnt} images\n")
            f.write(f"\n**Total (interim)**: {r['interim_total']} images\n\n")
        else:
            f.write("_No interim data found._\n\n")

        # REJECTS (from CSV)
        rej = r["rejects_by_reason"]
        if rej:
            f.write("### Rejects (from cleaning log)\n")
            # per class breakdown
            total_rej = 0
            for cls in sorted(rej.keys()):
                reasons = rej[cls]
                cls_total = sum(reasons.values())
                total_rej += cls_total
                pretty = ", ".join([f"{nice_name(reason)}: {count}" for reason, count in sorted(reasons.items())])
                f.write(f"- **{nice_name(cls)}**: {cls_total} ({pretty})\n")
            f.write(f"\n**Total rejects (logged)**: {total_rej}\n\n")

        f.write("\n")

print(f"\n✅ Audit results written to {audit_file}")
