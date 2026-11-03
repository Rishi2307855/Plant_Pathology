
from pathlib import Path
import json
import tensorflow as tf
from tensorflow.keras import layers, Model

# Project configuration
DATA_DIR = Path("data/plantvillage/train")
IMAGE_SIZE = (224, 224)

print("Building Tomato Disease Detection Model...")

# 1. Read class names in alphabetical order
class_names = sorted(
    folder.name
    for folder in DATA_DIR.iterdir()
    if folder.is_dir()
)

if len(class_names) != 10:
    raise ValueError(
        f"Expected 10 disease classes, found {len(class_names)}"
    )

# Save class mapping for future predictions
with open("class_names.json", "w") as file:
    json.dump(class_names, file, indent=4)

print("\nDisease categories:")
for index, name in enumerate(class_names):
    print(index, "-", name)

# 2. Load pre-trained MobileNetV2
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# 3. Freeze pre-trained layers initially
base_model.trainable = False

# 4. Build our classification model
inputs = layers.Input(
    shape=(224, 224, 3),
    name="leaf_image"
)

# Extract image features
x = base_model(inputs, training=False)

# Reduce feature dimensions
x = layers.GlobalAveragePooling2D()(x)

# Reduce overfitting
x = layers.Dropout(0.3)(x)

# Classify into 10 Tomato categories
outputs = layers.Dense(
    len(class_names),
    activation="softmax",
    name="disease_predictions"
)(x)

model = Model(
    inputs=inputs,
    outputs=outputs,
    name="Tomato_Disease_Detection"
)

# 5. Configure model training
model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# 6. Display architecture
print("\nModel created successfully!")
model.summary()

print("\nClass mapping saved to class_names.json")
