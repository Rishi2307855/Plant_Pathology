
from pathlib import Path
import json
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

# Configuration
DATA_DIR = Path("data/plantvillage")
MODEL_DIR = Path("models")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 8
SEED = 42

MODEL_DIR.mkdir(exist_ok=True)

tf.keras.utils.set_random_seed(SEED)

# Load class names
with open(MODEL_DIR / "class_names.json") as file:
    class_names = json.load(file)

print("Loading previously trained model...")

model = tf.keras.models.load_model(
    MODEL_DIR / "best_tomato_model.keras"
)

# Access MobileNetV2
base_model = model.get_layer("mobilenetv2_1.00_224")

# Unfreeze MobileNetV2
base_model.trainable = True

# Freeze all layers first
for layer in base_model.layers:
    layer.trainable = False

# Unfreeze only the last 30 layers
for layer in base_model.layers[-30:]:
    if not isinstance(layer, layers.BatchNormalization):
        layer.trainable = True

print("\nFine-tuning configuration:")
print("Total MobileNetV2 layers:", len(base_model.layers))
print("Layers selected for fine-tuning: 30")
print(
    "Trainable MobileNetV2 layers:",
    sum(1 for layer in base_model.layers if layer.trainable)
)

# Load training dataset
print("\nLoading training data...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR / "train",
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names
)

# Load validation dataset
val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR / "train",
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names,
    shuffle=False
)

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# Calculate class weights
counts = [
    sum(
        1 for path in (DATA_DIR / "train" / name).iterdir()
        if path.suffix.lower() in [".jpg", ".jpeg", ".png"]
    )
    for name in class_names
]

total = sum(counts)
num_classes = len(class_names)

class_weights = {
    i: total / (num_classes * count)
    for i, count in enumerate(counts)
    if count > 0
}

# Compile with a lower learning rate
model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.00001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# Callbacks
callbacks = [
    EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True
    ),
    ModelCheckpoint(
        MODEL_DIR / "best_tomato_finetuned.keras",
        monitor="val_loss",
        save_best_only=True
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        patience=2,
        factor=0.2,
        min_lr=1e-7
    )
]

print("\nModel summary:")
model.summary()

print("\nStarting fine-tuning...")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks
)

# Save improved model separately
model.save(
    MODEL_DIR / "tomato_disease_finetuned.keras"
)

# Save fine-tuning history
with open(MODEL_DIR / "finetuning_history.json", "w") as file:
    json.dump(
        {
            key: [float(value) for value in values]
            for key, values in history.history.items()
        },
        file,
        indent=4
    )

print("\nFine-tuning completed!")
print("Fine-tuned model saved successfully.")
