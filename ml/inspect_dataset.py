
from datasets import load_dataset

print("Loading cached PlantVillage dataset...")

dataset = load_dataset(
    "mohanty/PlantVillage",
    name="default"
)

print("\nDATASET INFORMATION")
print(dataset)

for split_name, split_data in dataset.items():

    print(f"\n--- {split_name.upper()} ---")

    print("Total images:", len(split_data))

    print("Column names:")
    print(split_data.column_names)

    print("\nFeatures:")
    print(split_data.features)

    # Inspect only one sample
    sample = split_data[0]

    print("\nSample information:")

    for key, value in sample.items():

        if key == "image":
            print(
                "image:",
                type(value),
                "size:",
                getattr(value, "size", None),
                "mode:",
                getattr(value, "mode", None)
            )
        else:
            print(f"{key}: {value}")

print("\nInspection completed!")
