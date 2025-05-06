import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const imagesDir = path.resolve(__dirname, '../photos');
const cacheDir = path.resolve(__dirname, '../cache');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

/**
 * Resize an image to the specified width and height.
 * @param filename - The name of the image file (jpg)
 * @param width - The desired width
 * @param height - The desired height
 * @returns The path to the resized image
 */
export async function resizeImage(
  filename: string,
  width: number,
  height: number
): Promise<{ path: string; cached: boolean }> {
  const inputPath = path.join(imagesDir, filename);
  const outputFilename = `${path.parse(filename).name}_${width}x${height}.jpg`;
  const outputPath = path.join(cacheDir, outputFilename);

  // Check if resized image already exists in cache
  if (fs.existsSync(outputPath)) {
    return { path: outputPath, cached: true };
  }

  // Resize and save to cache
  await sharp(inputPath)
    .resize(width, height)
    .toFormat('jpeg')
    .toFile(outputPath);

  return { path: outputPath, cached: false };
}
