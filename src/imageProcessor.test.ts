import { resizeImage } from './imageProcessor';
import fs from 'fs';
// import path from 'path';

describe('resizeImage function', () => {
  const testImage = 'encenadaport.jpg';
  const width = 100;
  const height = 100;

  it('should resize an image and return the resized image path', async () => {
    const result = await resizeImage(testImage, width, height);
    expect(result).toBeDefined();
    expect(result.path).toContain(`${width}x${height}`);
    expect(fs.existsSync(result.path)).toBeTrue();
  });

  it('should return cached image if it exists', async () => {
    // First call to create the resized image
    await resizeImage(testImage, width, height);
    // Second call should return cached true
    const result = await resizeImage(testImage, width, height);
    expect(result.cached).toBeTrue();
  });

  it('should throw error for non-existent input image', async () => {
    await expectAsync(
      resizeImage('nonexistent.jpg', width, height)
    ).toBeRejected();
  });
});
