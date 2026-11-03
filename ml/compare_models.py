
import json
import numpy as np
import tensorflow as tf

from pathlib import Path
from sklearn.metrics import classification_report

MODEL_DIR = Path("models")
TEST_DIR = Path("data/plantvillage/test")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

# Load class names
with open(MODEL_DIR / "class_names.json") as file:
    class_names = json.load(file)

# Load the untouched test dataset
test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names,
    shuffle=False
)

# Actual test labels
y_true = np.concatenate([
    labels.numpy() for _, labels in test_ds
])

# Models to compare
models = {
    "Original Model": MODEL_DIR / "best_tomato_model.keras",
    "Fine-tuned Model": MODEL_DIR / "best_tomato_finetuned.keras"
}

results = {}

for model_name, model_path in models.items():

    print("\n" + "=" * 50)
    print(model_name)
    print("=" * 50)

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found: {model_path}"
        )

    model = tf.keras.models.load_model(model_path)

    loss, accuracy = model.evaluate(
        test_ds,
        verbose=1
    )

    predictions = model.predict(test_ds, verbose=1)

    y_pred = np.argmax(predictions, axis=1)

    print("\nTest accuracy:", round(accuracy * 100, 2), "%")
    print("Test loss:", round(float(loss), 4))

    print("\nClassification Report:")

    print(classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        zero_division=0
    ))

    results[model_name] = {
        "accuracy": float(accuracy),
        "loss": float(loss)
    }

# Final comparison
print("\n" + "=" * 50)
print("MODEL COMPARISON")
print("=" * 50)

for name, result in results.items():
    print(
        name,
        "Accuracy:",
        round(result["accuracy"] * 100, 2), "%"
    )

original = results["Original Model"]["accuracy"]
fine_tuned = results["Fine-tuned Model"]["accuracy"]

print("\nAccuracy difference:",
      round((fine_tuned - original) * 100, 2),
      "percentage points")

if fine_tuned > original:
    print("Fine-tuned model improved test accuracy.")
elif fine_tuned < original:
    print("Original model performed better.")
else:
    print("Both models achieved equal test accuracy.")

with open(MODEL_DIR / "model_comparison.json", "w") as file:
    json.dump(results, file, indent=4)

print("\nComparison saved successfully!")
