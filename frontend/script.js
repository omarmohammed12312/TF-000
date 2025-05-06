document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');

  async function loadImages() {
    gallery.innerHTML = '';
    const photos = ['encenadaport.jpg', 'fjord.jpg', 'icelandwaterfall.jpg', 'palmtunnel.jpg', 'santamonica.jpg'];

    photos.forEach((photo) => {
      const img = createImageElement(`/photos/${photo}`, photo);
      gallery.appendChild(img);
    });

    try {
      const response = await fetch('/uploads');
      const text = await response.text();
      const regex = /href="([^"]+\.jpg)"/gi;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const filename = match[1];
        if (!photos.includes(filename)) {
          const img = createImageElement(`/uploads/${filename}`, filename);
          gallery.appendChild(img);
        }
      }
    } catch (error) {
      console.error('Error loading uploaded images:', error);
    }
  }

  function createImageElement(src, alt) {
    const img = document.createElement('img');
    img.src = src + '?t=' + new Date().getTime(); // Prevent caching
    img.alt = alt;
    img.className = 'thumbnail';
    return img;
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadMessage.textContent = '';
    const fileInput = document.getElementById('image-upload');

    if (fileInput.files.length === 0) {
      uploadMessage.textContent = 'Please select a file.';
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
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        uploadMessage.textContent = data.message;
        fileInput.value = '';

        // Immediately add new image to the gallery
        const newImg = createImageElement(`/uploads/${file.name}`, file.name);
        gallery.appendChild(newImg);
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
