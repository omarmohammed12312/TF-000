import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { resizeImage } from './imageProcessor';

const app = express();
const port = process.env.PORT || 3000;

export { app };

app.use(express.json());

// Serve static files from uploads, cache, photos, and frontend directories
app.use('/uploads', express.static('uploads'));
app.use('/cache', express.static('cache'));
app.use('/photos', express.static('photos'));
app.use('/frontend', express.static('frontend'));

// Root endpoint for easier browser testing
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Welcome to the Image Processing API Server');
});

// Test endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Image resize endpoint
app.get('/api/resize', async (req: Request, res: Response) => {
  const filename = req.query.filename as string;
  const width = parseInt(req.query.width as string);
  const height = parseInt(req.query.height as string);

  if (!filename || isNaN(width) || isNaN(height)) {
    return res
      .status(400)
      .json({
        error:
          'Missing or invalid query parameters. Required: filename, width, height',
      });
  }

  // Check if the input image file exists
  const inputPath = path.resolve(__dirname, '../photos', filename);
  if (!fs.existsSync(inputPath)) {
    return res
      .status(400)
      .json({ error: `Image file "${filename}" does not exist.` });
  }

  try {
    const { path: resizedImagePath, cached } = await resizeImage(
      filename,
      width,
      height
    );
    if (cached) {
      return res
        .status(200)
        .json({ message: 'Photo already exists', path: resizedImagePath });
    }
    res.sendFile(resizedImagePath);
  } catch (error) {
    res
      .status(500)
      .json({
        error: 'Error processing image',
        details: error instanceof Error ? error.message : error,
      });
  }
});

// New API endpoint to list images in the photos directory
app.get('/api/images', (req: Request, res: Response) => {
  const photosDir = path.resolve(__dirname, '../photos');
  fs.readdir(photosDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read photos directory' });
    }
    // Filter jpg files only
    const jpgFiles = files.filter((file) =>
      file.toLowerCase().endsWith('.jpg')
    );
    res.json(jpgFiles);
  });
});

// Importing multer middleware

import multer from 'multer';

const uploadDir = 'photos';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg files are allowed'));
  }
};
const upload = multer({ storage, fileFilter });

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({
        error:
          'No file uploaded or invalid file type. Only .jpg files are allowed.',
      });
  }
  res
    .status(200)
    .json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(
    `Open your browser and go to http://localhost:${port}/frontend/index.html to access the frontend.`
  );
});
