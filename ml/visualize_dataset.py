
from pathlib import Path
import random
import matplotlib.pyplot as plt
from PIL import Image

DATA_DIR = Path("data/plantvillage/train")

random.seed(42)

class_folders = sorted(
    folder for folder in DATA_DIR.iterdir()
    if folder.is_dir()
)

fig, axes = plt.subplots(2, 5, figsize=(16, 8))
axes = axes.flatten()

for ax, folder in zip(axes, class_folders):

    images = [
        path for path in folder.iterdir()
        if path.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]

    if not images:
        ax.set_title("No images found")
        ax.axis("off")
        continue

    sample_path = random.choice(images)

    with Image.open(sample_path) as image:
        ax.imshow(image.convert("RGB"))

    title = folder.name.replace("Tomato___", "")
    title = title.replace("_", " ")

    ax.set_title(title, fontsize=9)
    ax.axis("off")

plt.suptitle("PlantVillage – Tomato Disease Dataset", fontsize=16)
plt.tight_layout()

plt.savefig("data/tomato_dataset_preview.png", dpi=150)
plt.show()

print("Dataset visualization completed!")
