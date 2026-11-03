
import tensorflow as tf

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Configuration
DATA_DIR = "data/plantvillage"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42

print("Preparing Tomato disease dataset...")

# 1. Load training data (80%)
train_ds = tf.keras.utils.image_dataset_from_directory(
    f"{DATA_DIR}/train",
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

# Get class names
class_names = train_ds.class_names

# 2. Load validation data (20%)
val_ds = tf.keras.utils.image_dataset_from_directory(
    f"{DATA_DIR}/train",
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
    shuffle=False,
    class_names=class_names
)

# 3. Load original test data
test_ds = tf.keras.utils.image_dataset_from_directory(
    f"{DATA_DIR}/test",
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int",
    shuffle=False,
    class_names=class_names
)

# 4. Normalize images for MobileNetV2
AUTOTUNE = tf.data.AUTOTUNE

def preprocess_data(images, labels):
    images = preprocess_input(images)
    return images, labels

train_ds = train_ds.map(
    preprocess_data,
    num_parallel_calls=AUTOTUNE
).prefetch(AUTOTUNE)

val_ds = val_ds.map(
    preprocess_data,
    num_parallel_calls=AUTOTUNE
).prefetch(AUTOTUNE)

test_ds = test_ds.map(
    preprocess_data,
    num_parallel_calls=AUTOTUNE
).prefetch(AUTOTUNE)

# 5. Display dataset information
print("\nDataset preparation completed!")

print("\nDisease categories:")
for index, name in enumerate(class_names):
    print(index, "-", name)

print("\nExpected image counts:")
print("Training: 11617")
print("Validation: 2904")
print("Testing: 3639")

# 6. Verify one batch
for images, labels in train_ds.take(1):
    print("\nBatch verification:")
    print("Image shape:", images.shape)
    print("Label shape:", labels.shape)
    print("Minimum pixel value:", float(tf.reduce_min(images)))
    print("Maximum pixel value:", float(tf.reduce_max(images)))

print("\nAll datasets are ready!")
