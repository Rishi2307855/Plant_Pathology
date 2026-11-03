
import json
from pathlib import Path
from collections import Counter

import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from PIL import Image

# Paths
DATA_DIR = Path("data/plantvillage/test")
MODEL_PATH = Path("models/tomato_disease_mobilenetv2.keras")

with open("models/class_names.json") as file:
    class_names = json.load(file)

# Load trained model
model = tf.keras.models.load_model(MODEL_PATH)

# Load test images without shuffling
test_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    image_size=(224, 224),
    batch_size=32,
    class_names=class_names,
    shuffle=False
)

# Predict
y_true = np.concatenate([
    labels.numpy() for _, labels in test_ds
])

probabilities = model.predict(test_ds, verbose=1)
y_pred = np.argmax(probabilities, axis=1)

# Locate Early Blight errors
early_index = class_names.index("Tomato___Early_blight")

early_errors = np.where(
    (y_true == early_index) &
    (y_pred != early_index)
)[0]

print("\nEarly Blight mistakes:", len(early_errors))

print("\nMost common incorrect predictions:")

wrong_predictions = Counter(
    class_names[y_pred[index]]
    for index in early_errors
)

for disease, count in wrong_predictions.most_common():
    print(disease, ":", count)

# Get original test file paths
file_paths = test_ds.file_paths

# Display up to 12 misclassified images
selected = early_errors[:12]

fig, axes = plt.subplots(3, 4, figsize=(16, 12))
axes = axes.flatten()

for ax, index in zip(axes, selected):

    image_path = file_paths[index]

    with Image.open(image_path) as image:
        ax.imshow(image.convert("RGB"))

    predicted = class_names[y_pred[index]]
    predicted = predicted.replace("Tomato___", "")
    predicted = predicted.replace("_", " ")

    ax.set_title(
        f"Predicted: {predicted}",
        fontsize=9
    )

    ax.axis("off")

# Hide unused plots
for ax in axes[len(selected):]:
    ax.axis("off")

plt.suptitle(
    "Actual Early Blight Images Classified Incorrectly",
    fontsize=15
)

plt.tight_layout()

plt.savefig(
    "models/early_blight_errors.png",
    dpi=150
)

plt.show()

print("\nSaved: models/early_blight_errors.png")
