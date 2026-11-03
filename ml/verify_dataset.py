
from pathlib import Path
from PIL import Image

DATA_DIR = Path("data/plantvillage")

CLASSES = [
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

EXTENSIONS = {".jpg", ".jpeg", ".png"}

for split in ["train", "test"]:
    print(f"\n{'=' * 45}")
    print(f"{split.upper()} DATASET")
    print("=" * 45)

    total = 0

    for class_name in CLASSES:
        folder = DATA_DIR / split / class_name

        if not folder.exists():
            print(f"ERROR: Missing folder: {class_name}")
            continue

        images = [
            file for file in folder.iterdir()
            if file.suffix.lower() in EXTENSIONS
        ]

        count = len(images)
        total += count

        print(f"{class_name}: {count}")

    print(f"\nTotal {split} images: {total}")

# Verify an actual image can be opened
sample_folder = DATA_DIR / "train" / CLASSES[0]
samples = list(sample_folder.glob("*"))

if not samples:
    raise RuntimeError("No sample images found!")

sample_path = samples[0]

with Image.open(sample_path) as image:
    image.verify()

with Image.open(sample_path) as image:
    print("\nIMAGE VERIFICATION")
    print("Filename:", sample_path.name)
    print("Format:", image.format)
    print("Dimensions:", image.size)
    print("Color mode:", image.mode)

print("\nDataset verification completed!")
