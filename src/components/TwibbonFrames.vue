```vue
<template>
  <div class="main-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container flex justify-between items-center">
        <h1 class="logo">picpulse</h1>
        <router-link to="/" class="back-button">Back to Home</router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container content">
      <!-- Frame Creation Section -->
      <section class="frame-creation-section">
        <h2 class="section-title">Create a New Frame</h2>
        <div class="creation-wrapper">
          <!-- Form -->
          <div class="frame-form">
            <div class="form-group">
              <label for="frame-name" class="form-label">Frame Name</label>
              <input
                id="frame-name"
                v-model="frameName"
                type="text"
                placeholder="Enter frame name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="frame-description" class="form-label">Description</label>
              <textarea
                id="frame-description"
                v-model="frameDescription"
                placeholder="Enter frame description"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="frame-image" class="form-label">Upload Frame Image</label>
              <input
                id="frame-image"
                type="file"
                accept="image/*"
                @change="handleFrameImageUpload"
                class="form-input upload-input"
                aria-describedby="frame-upload-help"
              />
              <span id="frame-upload-help" class="sr-only">Upload an image to convert into a frame by removing the center</span>
              <p v-if="frameErrorMessage" class="error-message">{{ frameErrorMessage }}</p>
            </div>
            <div class="form-group">
              <label for="border-width" class="form-label">Border Width (px)</label>
              <input
                id="border-width"
                v-model="borderWidth"
                type="range"
                min="20"
                max="150"
                class="form-range"
              />
              <span class="range-value">{{ borderWidth }}px</span>
            </div>
            <div class="form-group">
              <label for="photo-upload" class="form-label">Upload Your Photo (Optional)</label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="form-input upload-input"
                aria-describedby="upload-help"
              />
              <span id="upload-help" class="sr-only">Upload an image to preview with the frame</span>
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </div>
            <button
              @click="createFrame"
              :disabled="!frameName || !frameDescription || !frameImage"
              class="create-button"
            >
              Create Frame
            </button>
          </div>
          <!-- Preview -->
          <div class="frame-preview">
            <h3 class="preview-title">Preview</h3>
            <canvas ref="canvas" class="preview-canvas"></canvas>
            <button v-if="processedFrameImage" @click="downloadFrameOnly" class="download-button secondary">
              Download Frame Only
            </button>
            <button v-if="resultImage" @click="downloadImage" class="download-button">
              Download Framed Image
            </button>
          </div>
        </div>
      </section>

      <!-- Frame Gallery -->
      <section class="frame-gallery">
        <h2 class="section-title">Available Frames</h2>
        <div class="gallery-grid">
          <div
            v-for="frame in frames"
            :key="frame.id"
            class="frame-card"
            @click="selectFrame(frame)"
            role="button"
            tabindex="0"
            @keydown.enter="selectFrame(frame)"
            :aria-label="`Select ${frame.name} frame`"
          >
            <div class="frame-preview">
              <img :src="frame.frameImage" alt="Frame preview" class="frame-image" />
            </div>
            <h3 class="frame-title">{{ frame.name }}</h3>
            <p class="frame-description">{{ frame.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const frameName = ref('');
const frameDescription = ref('');
const frameImage = ref(null);
const processedFrameImage = ref(null);
const canvas = ref(null);
const userPhoto = ref(null);
const resultImage = ref(null);
const frameErrorMessage = ref('');
const errorMessage = ref('');
const borderWidth = ref(80);

const frames = ref([
  {
    id: 1,
    name: 'Nature Frame',
    description: 'A green leaf-themed frame.',
    frameImage: 'https://via.placeholder.com/350x350.png?text=Nature+Frame'
  },
  {
    id: 2,
    name: 'Peace Frame',
    description: 'A peaceful dove-themed frame.',
    frameImage: 'https://via.placeholder.com/350x350.png?text=Peace+Frame'
  },
  {
    id: 3,
    name: 'Education Frame',
    description: 'An academic-themed frame with books.',
    frameImage: 'https://via.placeholder.com/350x350.png?text=Education+Frame'
  },
  {
    id: 4,
    name: 'Celebration Frame',
    description: 'A festive frame with stars.',
    frameImage: 'https://via.placeholder.com/350x350.png?text=Celebration+Frame'
  },
  {
    id: 5,
    name: 'Love Frame',
    description: 'A romantic heart-themed frame.',
    frameImage: 'https://via.placeholder.com/350x350.png?text=Love+Frame'
  }
]);

const createFrameFromImage = (image, borderWidthPx) => {
  const tempCanvas = document.createElement('canvas');
  const size = 350;
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d');

  // Draw the original image
  tempCtx.drawImage(image, 0, 0, size, size);

  // Get the image data
  const imageData = tempCtx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Remove center pixels (make them transparent)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      
      // Check if pixel is in the center area that should be removed
      const distanceFromLeft = x;
      const distanceFromRight = size - x;
      const distanceFromTop = y;
      const distanceFromBottom = size - y;
      
      // If pixel is not within border width from any edge, make it transparent
      if (distanceFromLeft > borderWidthPx && 
          distanceFromRight > borderWidthPx && 
          distanceFromTop > borderWidthPx && 
          distanceFromBottom > borderWidthPx) {
        data[index + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
  }

  // Put the modified data back
  tempCtx.putImageData(imageData, 0, 0);
  
  return tempCanvas.toDataURL('image/png');
};

const createFrame = () => {
  if (!frameName.value || !frameDescription.value || !frameImage.value) {
    alert('Please fill in all fields and upload a frame image.');
    return;
  }

  // Process the frame image to create border effect
  const processedFrame = createFrameFromImage(frameImage.value, borderWidth.value);
  processedFrameImage.value = processedFrame;

  const newFrame = {
    id: frames.value.length + 1,
    name: frameName.value,
    description: frameDescription.value,
    frameImage: processedFrame
  };
  frames.value.push(newFrame);
  alert('Frame created successfully!');
  
  // Clear form but keep the processed frame for preview
  frameName.value = '';
  frameDescription.value = '';
  frameImage.value = null;
  frameErrorMessage.value = '';
  
  // Update preview with the new frame
  previewFrame();
};

const selectFrame = (frame) => {
  processedFrameImage.value = frame.frameImage;
  previewFrame();
};

const handleFrameImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    frameErrorMessage.value = 'Please upload an image file.';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    frameErrorMessage.value = 'File size exceeds 5MB.';
    return;
  }

  frameErrorMessage.value = '';
  const reader = new FileReader();
  reader.onload = (e) => {
    frameImage.value = new Image();
    frameImage.value.onload = () => {
      // Process the image to create frame effect
      const processed = createFrameFromImage(frameImage.value, borderWidth.value);
      processedFrameImage.value = processed;
      previewFrame();
    };
    frameImage.value.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file.';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File size exceeds 5MB.';
    return;
  }

  errorMessage.value = '';
  const reader = new FileReader();
  reader.onload = (e) => {
    userPhoto.value = new Image();
    userPhoto.value.onload = () => {
      previewFrame();
    };
    userPhoto.value.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const previewFrame = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  const size = 350;
  canvas.value.width = size;
  canvas.value.height = size;

  // Clear canvas with background color
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, size, size);

  // Draw user photo first (background)
  if (userPhoto.value && userPhoto.value.complete) {
    const img = userPhoto.value;
    let drawWidth = size;
    let drawHeight = size;
    let offsetX = 0;
    let offsetY = 0;

    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1) {
      drawHeight = size / aspectRatio;
      offsetY = (size - drawHeight) / 2;
    } else {
      drawWidth = size * aspectRatio;
      offsetX = (size - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Draw frame on top
  if (processedFrameImage.value) {
    const frameImg = new Image();
    frameImg.onload = () => {
      ctx.drawImage(frameImg, 0, 0, size, size);
      resultImage.value = canvas.value.toDataURL('image/png');
    };
    frameImg.src = processedFrameImage.value;
  } else {
    clearCanvas();
  }
};

const clearCanvas = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Frame preview will appear here', canvas.value.width / 2, canvas.value.height / 2);
};

const downloadImage = () => {
  if (!resultImage.value) return;

  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = `framed-image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadFrameOnly = () => {
  if (!processedFrameImage.value) return;

  const link = document.createElement('a');
  link.href = processedFrameImage.value;
  link.download = `frame-only-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Watch for border width changes to update preview
const updateBorderWidth = () => {
  if (frameImage.value) {
    const processed = createFrameFromImage(frameImage.value, borderWidth.value);
    processedFrameImage.value = processed;
    previewFrame();
  }
};

// Add reactive update for border width
const unwatchBorderWidth = ref(null);
onMounted(() => {
  clearCanvas();
  // Watch border width changes
  unwatchBorderWidth.value = setInterval(() => {
    if (frameImage.value && processedFrameImage.value) {
      updateBorderWidth();
    }
  }, 100);
});

// Clean up interval on unmount
onUnmounted(() => {
  if (unwatchBorderWidth.value) {
    clearInterval(unwatchBorderWidth.value);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-yellow: #ffc107;
  --bg-dark: #1a1a1a;
  --text-white: #ffffff;
  --text-gray: #b0b0b0;
  --border-gray: #333333;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.main-container {
  min-height: 100vh;
  background: var(--bg-dark);
  font-family: 'Inter', sans-serif;
  color: var(--text-white);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.navbar {
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-dark);
  box-shadow: var(--shadow);
}

.logo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-white);
  text-transform: lowercase;
}

.back-button {
  color: var(--primary-yellow);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #e0a800;
}

.section-title {
  font-family: 'Satisfy', cursive;
  font-size: 3rem;
  color: var(--text-white);
  text-align: center;
  margin-bottom: 2rem;
  text-transform: lowercase;
}

.frame-creation-section {
  background: #222222;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow);
}

.creation-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .creation-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
}

.frame-form,
.frame-preview {
  flex: 1;
}

.frame-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: var(--text-white);
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-gray);
  border-radius: 0.5rem;
  background: #2a2a2a;
  color: var(--text-white);
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-yellow);
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  outline: none;
}

.upload-input {
  padding: 0.65rem 1rem;
}

.form-textarea {
  height: 120px;
  resize: vertical;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-gray);
  outline: none;
  appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-yellow);
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-yellow);
  cursor: pointer;
  border: none;
}

.range-value {
  color: var(--primary-yellow);
  font-weight: 600;
  margin-top: 0.5rem;
  display: block;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.create-button,
.download-button {
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-bottom: 0.5rem;
}

.create-button:hover:not(:disabled),
.download-button:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

.create-button:disabled {
  background: var(--border-gray);
  cursor: not-allowed;
  opacity: 0.6;
}

.download-button.secondary {
  background: var(--border-gray);
  color: var(--text-white);
}

.download-button.secondary:hover {
  background: #4a4a4a;
}

.download-button {
  width: 100%;
}

.frame-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-white);
  margin-bottom: 1rem;
}

.preview-canvas {
  width: 100%;
  max-width: 350px;
  height: 350px;
  border: 2px solid var(--border-gray);
  border-radius: 0.75rem;
  background: #2a2a2a;
  box-shadow: var(--shadow);
}

.frame-gallery {
  margin-top: 3rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.frame-card {
  background: #222222;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow);
}

.frame-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.frame-card:focus {
  outline: 3px solid var(--primary-yellow);
  outline-offset: 2px;
}

.frame-preview {
  width: 100%;
  height: 12rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.frame-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-white);
  margin-bottom: 0.5rem;
}

.frame-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: var(--text-gray);
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
```