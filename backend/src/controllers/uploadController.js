const cloudinary = require("../config/cloudinary");

// Upload Image to Cloudinary
const uploadImage = async (req, res) => {
  try {
    // Check whether an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image"
      });
    }

    // Upload image buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "plant_pathology",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Return uploaded image details
    res.status(201).json({
      message: "Image uploaded successfully",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error("Image upload error:", error.message);

    res.status(500).json({
      message: "Image upload failed"
    });
  }
};

module.exports = { uploadImage };