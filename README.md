# Image Processing API

Welcome to the Image Processing API! This project is a simple and powerful tool built with Node.js, Express, and TypeScript that lets you resize and upload images easily. It also includes a friendly frontend gallery where you can view and resize your images with just a few clicks.

## Features

- A backend API built with Express and TypeScript
- Resize images on the fly using Sharp
- Upload images easily with Multer
- Cache resized images to speed up repeated requests
- A frontend gallery to view, upload, and resize images
- Unit tests to keep the code reliable
- Code quality maintained with ESLint and Prettier

## How to Get Started

Follow these simple steps to get the project up and running on your machine:

1. Install the project dependencies:

   ```
   npm install
   ```

2. Build the project:

   ```
   npm run build
   ```

3. Start the server:

   ```
   npm start
   ```

4. Run the tests to make sure everything is working:

   ```
   npm test
   ```

## Important Note

When you want to use the frontend gallery, please open it by navigating to:

```
http://localhost:3000/frontend/index.html
```

instead of just `http://localhost:3000`. This will ensure you see the gallery interface correctly.

## API Endpoints

- `GET /api/health` - Check if the server is running
- `GET /api/resize` - Resize an image by providing query parameters:
  - `filename` (string): Name of the image file (e.g., encenadaport.jpg)
  - `width` (number): Desired width in pixels
  - `height` (number): Desired height in pixels

## Caching

Resized images are saved in the `cache` folder at the root of the project. When you resize an image for the first time, it gets stored here with a name showing the original file and the new size (for example, `encenadaport_200x200.jpg`). If you resize the same image with the same dimensions again, the cached version will be used to speed things up.

## License

MIT
