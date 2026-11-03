
from pathlib import Path
from io import BytesIO
from urllib.parse import urlparse

import json
import numpy as np
import tensorflow as tf
import httpx

from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl


# --------------------------------------------------
# 1. PROJECT CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "best_tomato_finetuned.keras"
CLASS_PATH = BASE_DIR / "models" / "class_names.json"

IMAGE_SIZE = (224, 224)
MODEL_VERSION = "2.0"
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB


# --------------------------------------------------
# 2. LOAD TRAINED MODEL
# --------------------------------------------------

print("Loading Tomato Disease Detection Model...")

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not CLASS_PATH.exists():
    raise FileNotFoundError(f"Class names not found: {CLASS_PATH}")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "r") as file:
    class_names = json.load(file)

print("Model loaded successfully!")
print("Number of disease categories:", len(class_names))


# --------------------------------------------------
# 3. CREATE FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="Plant Pathology ML API",
    description="Tomato Leaf Disease Detection API",
    version=MODEL_VERSION
)


# --------------------------------------------------
# 4. REQUEST SCHEMA
# --------------------------------------------------

class PredictionRequest(BaseModel):
    image_url: HttpUrl


# --------------------------------------------------
# 5. HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Plant Pathology ML API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_version": MODEL_VERSION,
        "supported_classes": len(class_names)
    }


# --------------------------------------------------
# 6. PREDICTION API
# --------------------------------------------------

@app.post("/predict")
def predict_disease(request: PredictionRequest):

    image_url = str(request.image_url)

    # Only allow images hosted by our Cloudinary account's domain
    parsed_url = urlparse(image_url)

    if (
        parsed_url.scheme != "https"
        or parsed_url.hostname != "res.cloudinary.com"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only HTTPS Cloudinary image URLs are accepted"
        )

    try:
        # Download image from Cloudinary
        image_bytes = bytearray()

        with httpx.stream(
            "GET",
            image_url,
            timeout=30,
            follow_redirects=False
        ) as response:

            response.raise_for_status()

            content_type = response.headers.get(
                "content-type", ""
            )

            if not content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail="The provided URL does not contain an image"
                )

            content_length = response.headers.get("content-length")

            if content_length and int(content_length) > MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail="Image must be smaller than 8 MB"
                )

            for chunk in response.iter_bytes():
                image_bytes.extend(chunk)

                if len(image_bytes) > MAX_IMAGE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Image must be smaller than 8 MB"
                    )

        # Open and process the image
        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

        image = image.resize(IMAGE_SIZE)

        # Prepare image for TensorFlow
        image_array = np.array(
            image,
            dtype=np.float32
        )

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # Predict disease
        # Preprocessing is already included in our saved model.
        predictions = model.predict(
            image_array,
            verbose=0
        )[0]

        predicted_index = int(np.argmax(predictions))

        predicted_class = class_names[predicted_index]

        confidence = float(
            predictions[predicted_index] * 100
        )

        # Get top 3 predictions
        top_indices = np.argsort(predictions)[::-1][:3]

        top_predictions = []

        for index in top_indices:
            top_predictions.append({
                "disease": class_names[int(index)],
                "confidence": round(
                    float(predictions[index] * 100), 2
                )
            })

        # Return result
        return {
            "message": "Prediction completed successfully",
            "predicted_disease": predicted_class,
            "confidence": round(confidence, 2),
            "model_version": MODEL_VERSION,
            "top_predictions": top_predictions
        }

    except HTTPException:
        raise

    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve image from Cloudinary"
        )

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or unsupported image"
        )

    except Exception as error:
        print("Prediction error:", error)

        raise HTTPException(
            status_code=500,
            detail="Prediction failed"
        )
