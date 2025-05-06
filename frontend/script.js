document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');
  const resizeSection = document.getElementById('resize-section');
  const selectedImage = document.getElementById('selected-image');
  const resizeForm = document.getElementById('resize-form');
  const resizeResult = document.getElementById('resize-result');
  let currentImage = '';

  // Load images
  async function loadImages() {
    gallery.innerHTML = '';
    // Load from photos folder
    const photos = [
      'encenadaport.jpg',
      'fjord.jpg',
      'icelandwaterfall.jpg',
      'palmtunnel.jpg',
      'santamonica.jpg',
    ];

    photos.forEach((photo) => {
      const img = document.createElement('img');
      img.src = `/photos/${photo}`;
      img.alt = photo;
      img.className = 'thumbnail';
      img.addEventListener('click', () => selectImage(photo, img));
      gallery.appendChild(img);
    });

    // Load uploaded images from /uploads
    try {
      const response = await fetch('/uploads');
      if (response.ok) {
        const text = await response.text();
        const regex = /href="([^"]+\.jpg)"/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const filename = match[1];
          if (!photos.includes(filename)) {
            const img = document.createElement('img');
            img.src = `/uploads/${filename}`;
            img.alt = filename;
            img.className = 'thumbnail';
            img.addEventListener('click', () => selectImage(filename, img));
            gallery.appendChild(img);
          }
        }
      }
    } catch (error) {
      console.error('Error loading uploaded images:', error);
    }
  }

  function selectImage(filename, imgElement) {
    currentImage = filename;
    selectedImage.src = imgElement.src;
    resizeSection.style.display = 'block';
    resizeResult.textContent = '';

    // Remove 'selected' class from all thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb) => thumb.classList.remove('selected'));

    // Add 'selected' class to clicked thumbnail
    imgElement.classList.add('selected');
  }

  resizeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    if (!currentImage) {
      resizeResult.textContent = 'Please select an image first.';
      return;
    }
    if (!width || !height) {
      resizeResult.textContent = 'Please enter width and height.';
      return;
    }
    resizeResult.textContent = 'Resizing...';

    try {
      const url = `/api/resize?filename=${encodeURIComponent(
        currentImage
      )}&width=${width}&height=${height}`;
      const response = await fetch(url);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('application/json')) {
          const data = await response.json();
          if (data.message === 'Photo already exists') {
            resizeResult.textContent = 'Photo already exists in cache.';
          } else {
            resizeResult.textContent = 'Resize completed.';
          }
        } else {
          // Show resized image
          const blob = await response.blob();
          const resizedUrl = URL.createObjectURL(blob);
          resizeResult.innerHTML = `<img src="${resizedUrl}" alt="Resized Image" />`;
        }
      } else {
        resizeResult.textContent = 'Error resizing image.';
      }
    } catch (error) {
      resizeResult.textContent = 'Error resizing image.';
      console.error(error);
    }
  });

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadMessage.textContent = '';
    const fileInput = document.getElementById('image-upload');
    if (fileInput.files.length === 0) {
      uploadMessage.textContent = 'Please select a file to upload.';
      return;
    }
    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith('.jpg')) {
      uploadMessage.textContent = 'Only .jpg files are allowed.';
      return;
    }
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        uploadMessage.textContent = data.message;
        fileInput.value = '';
        await loadImages();
      } else {
        uploadMessage.textContent = 'Upload failed.';
      }
    } catch (error) {
      uploadMessage.textContent = 'Upload failed.';
      console.error(error);
    }
  });

  loadImages();
});
