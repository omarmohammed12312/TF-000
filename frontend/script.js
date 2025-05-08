document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');
  const resizeSection = document.getElementById('resize-section');
  const selectedImage = document.getElementById('selected-image');
  const resizeForm = document.getElementById('resize-form');
  const resizeResult = document.getElementById('resize-result');

  async function loadImages() {
    gallery.innerHTML = '';

    try {
      // Fetch photos dynamically from /api/images endpoint
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      const photos = await response.json();

      photos.forEach((photo) => {
        const img = createImageElement(`/photos/${photo}`, photo);
        img.addEventListener('click', () => selectImage(img.src, photo));
        gallery.appendChild(img);
      });

      // Also load uploaded images from /uploads directory
      const uploadsResponse = await fetch('/uploads');
      const text = await uploadsResponse.text();
      const regex = /href="([^"]+\.jpg)"/gi;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const filename = match[1];
        if (!photos.includes(filename)) {
          const img = createImageElement(`/uploads/${filename}`, filename);
          img.addEventListener('click', () => selectImage(img.src, filename));
          gallery.appendChild(img);
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  function createImageElement(src, alt) {
    const img = document.createElement('img');
    img.src = src + '?t=' + new Date().getTime(); // Prevent caching
    img.alt = alt;
    img.className = 'thumbnail';
    return img;
  }

  function selectImage(src, alt) {
    selectedImage.src = src;
    selectedImage.alt = alt;
    resizeSection.style.display = 'block';
    resizeResult.innerHTML = '';
    resizeResult.classList.remove('info-message', 'error-message');
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        uploadMessage.textContent = data.message;
        fileInput.value = '';

        // Reload gallery images after successful upload
        await loadImages();
      } else {
        uploadMessage.textContent = 'Upload failed.';
      }
    } catch (error) {
      uploadMessage.textContent = 'Upload failed.';
      console.error(error);
    }
  });

  resizeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resizeResult.innerHTML = '';
    resizeResult.classList.remove('info-message', 'error-message');

    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const filename = selectedImage.alt;

    if (!width || !height) {
      resizeResult.textContent = 'Please enter valid width and height.';
      resizeResult.classList.add('error-message');
      return;
    }

    try {
      console.log(
        'Sending resize request for',
        filename,
        'with width',
        width,
        'and height',
        height
      );
      const response = await fetch(
        '/api/resize?filename=' +
          encodeURIComponent(filename) +
          '&width=' +
          width +
          '&height=' +
          height
      );
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Resize response JSON:', data);
          if (data.path) {
            resizeResult.innerHTML =
              '<img src="' +
              data.path +
              '?t=' +
              new Date().getTime() +
              '" alt="Resized Image" />';
          } else if (data.message) {
            resizeResult.textContent = data.message;
            if (data.message === 'Photo already exists') {
              resizeResult.classList.add('info-message');
            } else {
              resizeResult.classList.add('error-message');
            }
          } else if (data.error) {
            resizeResult.textContent = 'Error: ' + data.error;
            resizeResult.classList.add('error-message');
          }
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          resizeResult.innerHTML =
            '<img src="' + url + '" alt="Resized Image" />';
        }
      } else {
        resizeResult.textContent = 'Resize failed.';
        resizeResult.classList.add('error-message');
      }
    } catch (error) {
      resizeResult.textContent = 'Resize failed.';
      resizeResult.classList.add('error-message');
      console.error(error);
    }
  });

  loadImages();
});
