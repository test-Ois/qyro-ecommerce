const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {

  try {

    const result = await new Promise((resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {

          if (error) reject(error);
          else resolve(result);

        }
      );

      stream.end(req.file.buffer);

    });

    res.json({ url: result.secure_url });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;