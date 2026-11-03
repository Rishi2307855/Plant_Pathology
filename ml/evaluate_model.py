
from pathlib import Path
import json
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

DATA_DIR = Path("data/plantvillage")
MODEL_DIR = Path("models")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

# Load class names
with open(MODEL_DIR / "class_names.json", "r") as file:
    class_names = json.load(file)

# Load trained model
print("Loading trained model...")

model = tf.keras.models.load_model(
    MODEL_DIR / "tomato_disease_mobilenetv2.keras"
)

# Load untouched test dataset
print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR / "test",
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names,
    shuffle=False
)

# Evaluate model
print("\nEvaluating model...")

test_loss, test_accuracy = model.evaluate(test_ds)

print("\nTEST RESULTS")
print("Test accuracy:", round(test_accuracy * 100, 2), "%")
print("Test loss:", round(float(test_loss), 4))

# Actual labels
y_true = np.concatenate([
    labels.numpy() for _, labels in test_ds
])

# Predicted labels
predictions = model.predict(test_ds, verbose=1)
y_pred = np.argmax(predictions, axis=1)

# Classification report
report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    output_dict=True,
    zero_division=0
)

print("\nCLASSIFICATION REPORT")

print(classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    zero_division=0
))

# Confusion matrix
cm = confusion_matrix(
    y_true,
    y_pred,
    labels=range(len(class_names))
)

display_names = [
    name.replace("Tomato___", "").replace("_", " ")
    for name in class_names
]

fig, ax = plt.subplots(figsize=(14, 11))

display = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=display_names
)

display.plot(
    ax=ax,
    xticks_rotation=90,
    cmap="Blues",
    colorbar=False
)

plt.title("Tomato Disease Detection - Confusion Matrix")
plt.tight_layout()

plt.savefig(
    MODEL_DIR / "confusion_matrix.png",
    dpi=180
)

# Save evaluation metrics
results = {
    "test_accuracy": float(test_accuracy),
    "test_loss": float(test_loss),
    "classification_report": report
}

with open(MODEL_DIR / "evaluation_results.json", "w") as file:
    json.dump(results, file, indent=4)

print("\nEvaluation completed!")
print("Confusion matrix saved.")
print("Results saved in models/evaluation_results.json")
