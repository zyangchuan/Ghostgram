const express = require("express");
require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config()

// Configure AWS with your access key and secret key (or use IAM roles)
// It is recommended to use IAM roles for production environments
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

const app = express();
// Increased limit to handle large base64 image strings
app.use(express.json({ limit: '20mb' }));

/**
 * Decodes a base64 string with a data URI scheme (e.g., "data:image/jpeg;base64,...")
 * @param {string} dataString The base64 data URI string.
 * @returns {object|Error} An object with type and data buffer, or an Error.
 */
const decodeBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let response = {};

  if (!matches || matches.length !== 3) {
    return new Error('Invalid base64 image string. Expected format: data:image/jpeg;base64,...');
  }

  response.type = matches[1]; // e.g., 'image/jpeg'
  response.data = Buffer.from(matches[2], 'base64'); // Decoded buffer

  return response;
}

/**
 * Uploads a raw base64 encoded image to S3.
 * @param {string} base64Data The raw base64 image data (without data URI).
 * @param {string} mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
const uploadRawBase64ToS3 = async (base64Data, mimeType) => {
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const fileExtension = mimeType.split('/')[1] || 'bin';
    const fileName = `images/${uuidv4()}.${fileExtension}`;

    const params = {
        Bucket: "ghostgram-images", // Make sure this bucket name is correct
        Key: fileName,
        Body: imageBuffer,
        ContentType: mimeType,
    };

    await s3.putObject(params).promise();

    // Construct the URL manually
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};

// Rate limiter for the /redact-image endpoint
const redactImageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 requests per windowMs
    message: "Too many requests from this IP, please try again after a minute",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.post('/redact-image', redactImageLimiter, async (req, res) => {
    // Expects a raw base64 string in `image`, and a JSON object for `sensitive_regions`
    const { image, sensitive_regions } = req.body;

    if (!image || !sensitive_regions) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Request must include "image" (as a raw base64 string) and "sensitive_regions".' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL_ID = "gemini-2.5-flash-image-preview"; // Using a recommended model for this task
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

    const requestPayload = {
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "inlineData": {
                  "mimeType": "image/jpeg", // Assuming JPEG, Gemini can handle various types
                  "data": image // Pass the raw base64 string directly
                }
              },
              {
                "text": `You are an image editor. Take the uploaded image and the provided JSON with sensitive_regions.Only edit the regions defined in the JSON. Do not modify anything outside of these regions.Editing RulesFor each region in the JSON:If \"type\": \"face\" → replace with a generic, non-identifiable face.Neutral expression (slight smile or relaxed look).Realistic, matching skin tone, angle, and lighting.Blend seamlessly with the scene.If \"type\": \"street_sign\" or \"type\": \"traffic_sign\" → replace text with different, non-identifiable text.Preserve the same style, font, size, orientation, and color.Keep it authentic and realistic.If \"type\": \"text\" (e.g., shop names, rule boards) → replace with generic placeholder names/info.Match the original design, font, and perspective.General RequirementsEdit only inside sensitive regions from the JSON.Ensure seamless blending (no visible masking, patches, or distortion).Preserve realism, perspective, and lighting across the entire image.Apply slight softening/blur if needed for natural depth-of-field.Negative Rules (Do Not)Do not edit any area outside the specified sensitive_regions.Do not blur, pixelate, or censor sensitive regions.Do not leave blank spots, artifacts, or visible patches.Do not generate faces resembling celebrities, real people, or identifiable individuals.Do not introduce unrelated, cartoonish, surreal, or distorted elements.Do not generate real street names, shop names, or text tied to actual locations.Do not add watermarks, logos, or visible AI artifacts.Do not alter the global lighting, perspective, or content outside of the sensitive regions.Output RequirementReturn a clean, natural-looking image where only the specified sensitive_regions are replaced according to these rules. The rest of the image must remain completely unchanged.\"sensitive_regions\": ${JSON.stringify(sensitive_regions)}`
              },
            ]
          },
        ],
    };

    try {
        const geminiResponse = await axios.post(API_URL, requestPayload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Extract the raw base64 image data from the Gemini API response
        const redactedImagePart = geminiResponse.data.candidates[0]?.content?.parts?.find(p => p.inlineData);

        if (!redactedImagePart || !redactedImagePart.inlineData.data) {
            throw new Error("No image data found in the Gemini API response.");
        }

        const redactedImageBase64 = redactedImagePart.inlineData.data;
        const redactedMimeType = redactedImagePart.inlineData.mimeType;

        // Upload the new redacted image to S3
        const imageUrl = await uploadRawBase64ToS3(redactedImageBase64, redactedMimeType);

        res.status(StatusCodes.OK).json({
            message: 'Image redacted and uploaded successfully!',
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error('Error processing image redaction:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to redact and upload image.', error: error.message });
    }
});


app.post('/upload-image', async (req, res) => {
  // This endpoint still expects the base64 string with the data URI prefix
  const { image } = req.body;

  if (!image) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No image data provided.' });
  }

  try {
    const decodedImage = decodeBase64Image(image);

    if (decodedImage instanceof Error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: decodedImage.message });
    }

    const imageType = decodedImage.type;
    const imageBuffer = decodedImage.data;

    const fileExtension = imageType.split('/')[1] || 'bin';
    const fileName = `images/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: "ghostgram-images",
      Key: fileName,
      Body: imageBuffer,
      ContentType: imageType,
    };

    const s3PutObjectResult = await s3.putObject(params).promise();
    const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    res.status(StatusCodes.OK).json({
      message: 'Image uploaded successfully!',
      imageUrl: imageUrl,
      s3Key: params.Key,
      eTag: s3PutObjectResult.ETag
    });

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to upload image.', error: error.message });
  }
});

app.use("/", (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "Server is running." });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});