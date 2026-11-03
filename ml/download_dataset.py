
from pathlib import Path, PurePosixPath
from collections import Counter
from huggingface_hub import hf_hub_download
from zipfile import ZipFile
from PIL import Image
import shutil

REPO_ID = "mohanty/PlantVillage"

OUTPUT_DIR = Path("data/plantvillage")

# Expected Tomato categories
TOMATO_CLASSES = [
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


def download_file(filename):
    print(f"\nDownloading: {filename}")

    return hf_hub_download(
        repo_id=REPO_ID,
        filename=filename,
        repo_type="dataset"
    )


def extract_tomato_images(zip_path, manifest_path, split, archive):
    output_split = OUTPUT_DIR / split
    output_split.mkdir(parents=True, exist_ok=True)

    counts = Counter()
    missing = []

    with open(manifest_path, "r") as file:
        image_paths = [
            line.strip()
            for line in file
            if line.strip()
        ]

    archive_names = set(archive.namelist())

    for relative_path in image_paths:

        parts = PurePosixPath(relative_path).parts

        if (
            len(parts) != 4
            or parts[0] != "raw"
            or parts[1] != "color"
            or parts[2] not in TOMATO_CLASSES
        ):
            continue

        class_name = parts[2]
        filename = parts[3]

        # Locate the image in the ZIP archive
        archive_path = relative_path

        if archive_path not in archive_names:
            matches = [
                name for name in archive_names
                if name.endswith("/" + relative_path)
            ]

            if not matches:
                missing.append(relative_path)
                continue

            archive_path = matches[0]

        destination = output_split / class_name / filename
        destination.parent.mkdir(parents=True, exist_ok=True)

        # Avoid extracting files again when rerunning
        if not destination.exists():
            with archive.open(archive_path) as source:
                with open(destination, "wb") as target:
                    shutil.copyfileobj(source, target)

        counts[class_name] += 1

    print(f"\n{split.upper()} SUMMARY")

    for class_name in TOMATO_CLASSES:
        print(f"{class_name}: {counts[class_name]}")

    print("Total images:", sum(counts.values()))
    print("Missing images:", len(missing))

    if missing:
        print("First missing paths:", missing[:5])
        raise RuntimeError("Some manifest images were missing from the archive.")

    if any(counts[name] == 0 for name in TOMATO_CLASSES):
        raise RuntimeError("At least one Tomato class has no images.")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Download the original RGB archive
    zip_path = download_file("data.zip")

    # Download official split manifests
    train_manifest = download_file("splits/color_train.txt")
    test_manifest = download_file("splits/color_test.txt")

    print("\nOpening image archive...")

    with ZipFile(zip_path, "r") as archive:

        extract_tomato_images(
            zip_path,
            train_manifest,
            "train",
            archive
        )

        extract_tomato_images(
            zip_path,
            test_manifest,
            "test",
            archive
        )

    # Verify one actual photograph
    sample_folder = OUTPUT_DIR / "train" / TOMATO_CLASSES[0]
    sample_image = next(sample_folder.glob("*"))

    with Image.open(sample_image) as image:
        image.verify()

    print("\nDataset preparation successful!")
    print("Sample image:", sample_image)
    print("Dataset location:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
