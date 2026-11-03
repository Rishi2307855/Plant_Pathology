
from pathlib import Path
import json
import numpy as np
import tensorflow as tf

from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
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
EPOCHS = 10
SEED = 42

tf.keras.utils.set_random_seed(SEED)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

print("Preparing training and validation data...")

# Read class names in alphabetical order
train_path = DATA_DIR / "train"

class_names = sorted(
    folder.name for folder in train_path.iterdir()
    if folder.is_dir()
)

num_classes = len(class_names)

if num_classes != 10:
    raise ValueError(f"Expected 10 classes, found {num_classes}")

# Load training data
train_ds = tf.keras.utils.image_dataset_from_directory(
    train_path,
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names
)

# Load validation data
val_ds = tf.keras.utils.image_dataset_from_directory(
    train_path,
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_names=class_names,
    shuffle=False
)

# Calculate class weights
counts = []

for class_name in class_names:
    folder = train_path / class_name
    count = sum(
        1 for p in folder.iterdir()
        if p.suffix.lower() in [".jpg", ".jpeg", ".png"]
    )
    counts.append(count)

if any(count == 0 for count in counts):
    raise ValueError("A class has zero images")

total_images = sum(counts)

class_weights = {
    index: total_images / (num_classes * count)
    for index, count in enumerate(counts)
}

print("\nClass weights calculated:")
for name, weight in zip(class_names, class_weights.values()):
    print(f"{name}: {weight:.3f}")

# Improve dataset loading efficiency
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# Data augmentation
augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.08),
    layers.RandomZoom(0.1)
], name="data_augmentation")

# Load pretrained MobileNetV2
print("\nLoading MobileNetV2...")

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# Build classification model
inputs = layers.Input(shape=(224, 224, 3))

x = augmentation(inputs)
x = preprocess_input(x)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    num_classes,
    activation="softmax"
)(x)

model = Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
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
        filepath=str(MODEL_DIR / "best_tomato_model.keras"),
        monitor="val_loss",
        save_best_only=True
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=0.00001
    )
]

print("\nAvailable GPUs:", tf.config.list_physical_devices("GPU"))
print("\nStarting model training...")

# Train
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks
)

# Save final model and class mapping
model.save(MODEL_DIR / "tomato_disease_mobilenetv2.keras")

with open(MODEL_DIR / "class_names.json", "w") as file:
    json.dump(class_names, file, indent=4)

with open(MODEL_DIR / "training_history.json", "w") as file:
    json.dump(
        {key: [float(v) for v in values]
         for key, values in history.history.items()},
        file,
        indent=4
    )

print("\nTraining completed successfully!")
print("Models and training history saved in:", MODEL_DIR)
