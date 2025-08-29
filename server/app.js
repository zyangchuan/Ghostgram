const express = require("express");
require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');


// Configure AWS with your access key and secret key (or use IAM roles)
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

const app = express();
app.use(express.json({ limit: '10mb' }));

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

app.post('/upload-image', async (req, res) => {
  const { image } = req.body; // 'image' is expected to be the base64 string

  if (!image) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No image data provided.' });
  }

  try {
    const decodedImage = decodeBase64Image(image);

    if (decodedImage instanceof Error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: decodedImage.message });
    }

    const imageType = decodedImage.type; // e.g., 'image/jpeg'
    const imageBuffer = decodedImage.data; // The actual image data as a Buffer

    // Generate a unique file name
    const fileExtension = imageType.split('/')[1] || 'bin'; // Default to 'bin' if extension can't be determined
    const fileName = `images/${uuidv4()}.${fileExtension}`; // e.g., 'images/a1b2c3d4-e5f6-7890-1234-567890abcdef.jpeg'

    const params = {
      Bucket: "ghostgram-images",
      Key: fileName,
      Body: imageBuffer,
      ContentType: imageType, // Set the correct MIME type
    };

    // Upload the image to S3 using putObject [1]
    const s3PutObjectResult = await s3.putObject(params).promise();

    // Construct the URL manually as putObject doesn't return Location directly
    const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    res.status(StatusCodes.OK).json({
      message: 'Image uploaded successfully!',
      imageUrl: imageUrl,
      s3Key: params.Key,
      eTag: s3PutObjectResult.ETag // ETag is typically returned by putObject [2]
    });

  } catch (error) {
    console.error('Error uploading image to S3:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to upload image.', error: error.message });
  }
});

app.use("/", (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "ok" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
