Here is your full, corrected Vue component code with the unused tempCtx line removed to fix the ESLint no-unused-vars error. The code is based on your provided file and is ready to use.

text
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
      <!-- Campaign Creation Section -->
      <section class="campaign-section">
        <h2 class="section-title">Start Campaign</h2>
        <div class="campaign-wrapper">
          <!-- Form -->
          <div class="campaign-form">
            <div class="form-group">
              <label for="campaign-name" class="form-label">Campaign Name</label>
              <input
                id="campaign-name"
                v-model="campaignName"
                type="text"
                placeholder="Enter campaign name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="campaign-description" class="form-label">Campaign Description</label>
              <textarea
                id="campaign-description"
                v-model="campaignDescription"
                placeholder="Describe your campaign purpose"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="user-image" class="form-label">Upload Your Image</label>
              <input
                id="user-image"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="form-input upload-input"
                aria-describedby="image-upload-help"
              />
              <span id="image-upload-help" class="sr-only">Upload your image to add campaign background</span>
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </div>
          </div>
          <!-- Preview -->
          <div class="campaign-preview">
            <h3 class="preview-title">Campaign Preview</h3>
            <canvas ref="canvas" class="preview-canvas"></canvas>
            <div class="canvas-controls">
              <div class="position-controls">
                <label class="control-label">Image Position</label>
                <div class="control-group">
                  <label>X: <input v-model="imagePosition.x" type="range" min="-200" max="200" class="control-slider" /></label>
                  <label>Y: <input v-model="imagePosition.y" type="range" min="-200" max="200" class="control-slider" /></label>
                </div>
              </div>
              <div class="size-controls">
                <label class="control-label">Image Size</label>
                <input v-model="imageScale" type="range" min="0.2" max="2" step="0.1" class="control-slider" />
                <span class="control-value">{{ Math.round(imageScale * 100) }}%</span>
              </div>
            </div>
            <button v-if="resultImage" @click="downloadImage" class="download-button">
              Download Campaign Image
            </button>
          </div>
        </div>
      </section>

      <!-- Background Selection -->
      <section class="background-gallery">
        <h2 class="section-title">Choose Background</h2>
        <div class="bg-categories">
          <button 
            v-for="category in categories" 
            :key="category"
            @click="activeCategory = category"
            :class="['category-btn', { active: activeCategory === category }]"
          >
            {{ category }}
          </button>
        </div>
        <div class="gallery-grid">
          <div
            v-for="background in filteredBackgrounds"
            :key="background.id"
            class="bg-card"
            @click="selectBackground(background)"
            :class="{ selected: selectedBackground?.id === background.id }"
            role="button"
            tabindex="0"
            @keydown.enter="selectBackground(background)"
          >
            <div class="bg-preview" :style="{ background: background.style }">
              <div class="bg-overlay">
                <span class="bg-name">{{ background.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const campaignName = ref('');
const campaignDescription = ref('');
const userImage = ref(null);
const canvas = ref(null);
const resultImage = ref(null);
const errorMessage = ref('');
const selectedBackground = ref(null);
const activeCategory = ref('Gradient');
const imagePosition = ref({ x: 0, y: 0 });
const imageScale = ref(1);

const categories = ['Gradient', 'Solid', 'Pattern', 'Nature', 'Abstract'];
const backgrounds = ref([
  // Gradient Backgrounds
  {
    id: 1,
    name: 'Sunset Gradient',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)'
  },
  {
    id: 2,
    name: 'Ocean Gradient',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 3,
    name: 'Forest Gradient',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    id: 4,
    name: 'Purple Dream',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 5,
    name: 'Fire Gradient',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
  },
  {
    id: 6,
    name: 'Cool Blue',
    category: 'Gradient',
    style: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)'
  },
  // Solid Colors
  {
    id: 7,
    name: 'Deep Blue',
    category: 'Solid',
    style: '#1e3a8a'
  },
  {
    id: 8,
    name: 'Emerald Green',
    category: 'Solid',
    style: '#059669'
  },
  {
    id: 9,
    name: 'Royal Purple',
    category: 'Solid',
    style: '#7c3aed'
  },
  {
    id: 10,
    name: 'Sunset Orange',
    category: 'Solid',
    style: '#ea580c'
  },
  {
    id: 11,
    name: 'Rose Pink',
    category: 'Solid',
    style: '#e11d48'
  },
  {
    id: 12,
    name: 'Midnight Black',
    category: 'Solid',
    style: '#111827'
  },
  // Pattern Backgrounds
  {
    id: 13,
    name: 'Dots Pattern',
    category: 'Pattern',
    style: 'radial-gradient(circle, #333 1px, transparent 1px), #f0f0f0'
  },
  {
    id: 14,
    name: 'Stripes Pattern',
    category: 'Pattern',
    style: 'linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%)'
  },
  {
    id: 15,
    name: 'Grid Pattern',
    category: 'Pattern',
    style: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px), #fff'
  },
  {
    id: 16,
    name: 'Hexagon Pattern',
    category: 'Pattern',
    style: 'radial-gradient(circle at 25% 25%, #333 2px, transparent 2px), #f9f9f9'
  },
  // Nature Backgrounds
  {
    id: 17,
    name: 'Sky Blue',
    category: 'Nature',
    style: 'linear-gradient(to bottom, #87ceeb 0%, #98d8f4 100%)'
  },
  {
    id: 18,
    name: 'Earth Brown',
    category: 'Nature',
    style: 'linear-gradient(to bottom, #8b4513 0%, #a0522d 100%)'
  },
  {
    id: 19,
    name: 'Grass Green',
    category: 'Nature',
    style: 'linear-gradient(to bottom, #228b22 0%, #32cd32 100%)'
  },
  {
    id: 20,
    name: 'Ocean Deep',
    category: 'Nature',
    style: 'linear-gradient(to bottom, #006994 0%, #0080b3 100%)'
  },
  // Abstract Backgrounds
  {
    id: 21,
    name: 'Neon Glow',
    category: 'Abstract',
    style: 'radial-gradient(circle at 30% 30%, #ff00ff 0%, #00ffff 50%, #000 100%)'
  },
  {
    id: 22,
    name: 'Cosmic Wave',
    category: 'Abstract',
    style: 'linear-gradient(45deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)'
  },
  {
    id: 23,
    name: 'Aurora',
    category: 'Abstract',
    style: 'radial-gradient(ellipse at top, #00ff88 0%, #0066ff 50%, #000 100%)'
  },
  {
    id: 24,
    name: 'Prism',
    category: 'Abstract',
    style: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)'
  }
]);

const filteredBackgrounds = computed(() => {
  return backgrounds.value.filter(bg => bg.category === activeCategory.value);
});

const selectBackground = (background) => {
  selectedBackground.value = background;
  updatePreview();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file.';
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'File size exceeds 10MB.';
    return;
  }

  errorMessage.value = '';
  const reader = new FileReader();
  reader.onload = (e) => {
    userImage.value = new Image();
    userImage.value.onload = () => {
      updatePreview();
    };
    userImage.value.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const updatePreview = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  const width = 800;
  const height = 600;
  canvas.value.width = width;
  canvas.value.height = height;

  // Apply background
  if (selectedBackground.value) {
    if (selectedBackground.value.style.includes('gradient') || selectedBackground.value.style.includes('radial')) {
      // Create gradient background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      // const tempCtx = tempCanvas.getContext('2d'); // <-- Removed to fix 'no-unused-vars'
      
      // Create a div element to parse the CSS gradient
      const div = document.createElement('div');
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      div.style.background = selectedBackground.value.style;
      document.body.appendChild(div);
      
      // For now, use a solid color approximation for gradients
      if (selectedBackground.value.style.includes('#')) {
        const colors = selectedBackground.value.style.match(/#[0-9a-fA-F]{6}/g);
        if (colors && colors.length > 0) {
          ctx.fillStyle = colors[0];
        }
      } else {
        ctx.fillStyle = '#4f46e5'; // fallback color
      }
      
      document.body.removeChild(div);
    } else {
      // Solid color
      ctx.fillStyle = selectedBackground.value.style;
    }
    
    ctx.fillRect(0, 0, width, height);
  } else {
    // Default background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw user image if available
  if (userImage.value && userImage.value.complete) {
    const img = userImage.value;
    
    // Calculate image dimensions with scale
    const maxSize = Math.min(width, height) * 0.6;
    let drawWidth = maxSize * imageScale.value;
    let drawHeight = maxSize * imageScale.value;
    
    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }
    
    // Calculate position
    const centerX = width / 2;
    const centerY = height / 2;
    const x = centerX - drawWidth / 2 + parseInt(imagePosition.value.x);
    const y = centerY - drawHeight / 2 + parseInt(imagePosition.value.y);
    
    // Add shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Add campaign text overlay if name is provided
  if (campaignName.value) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - 80, width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(campaignName.value, width / 2, height - 45);
    
    if (campaignDescription.value) {
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(campaignDescription.value, width / 2, height - 20);
    }
  }

  if (!userImage.value && !selectedBackground.value) {
    clearCanvas();
  } else {
    resultImage.value = canvas.value.toDataURL('image/png');
  }
};

const clearCanvas = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Upload an image and select a background', canvas.value.width / 2, canvas.value.height / 2 - 10);
  ctx.fillText('to create your campaign visual', canvas.value.width / 2, canvas.value.height / 2 + 20);
};

const downloadImage = () => {
  if (!resultImage.value) return;

  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = `campaign-${campaignName.value || 'image'}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Watch for changes to update preview
watch([imagePosition, imageScale, campaignName, campaignDescription], () => {
  updatePreview();
}, { deep: true });

onMounted(() => {
  clearCanvas();
  // Set default background
  selectedBackground.value = backgrounds.value[0];
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
  --accent-blue: #3b82f6;
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

.campaign-section {
  background: #222222;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow);
}

.campaign-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .campaign-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
}

.campaign-form,
.campaign-preview {
  flex: 1;
}

.campaign-form {
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

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.campaign-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 400px;
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
  max-width: 500px;
  height: 375px;
  border: 2px solid var(--border-gray);
  border-radius: 0.75rem;
  background: #2a2a2a;
  box-shadow: var(--shadow);
}

.canvas-controls {
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-label {
  color: var(--text-white);
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.control-group {
  display: flex;
  gap: 1rem;
}

.control-group label {
  color: var(--text-gray);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-slider {
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-gray);
  outline: none;
  -webkit-appearance: none;
}

.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-yellow);
  cursor: pointer;
}

.control-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-yellow);
  cursor: pointer;
  border: none;
}

.size-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.size-controls .control-slider {
  flex: 1;
}

.control-value {
  color: var(--primary-yellow);
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 50px;
}

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
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
}

.download-button:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

.background-gallery {
  margin-top: 3rem;
}

.bg-categories {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-gray);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-gray);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover,
.category-btn.active {
  border-color: var(--primary-yellow);
  color: var(--primary-yellow);
  background: rgba(255, 193, 7, 0.1);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.bg-card {
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  box-shadow: var(--shadow);
}

.bg-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.bg-card.selected {
  border-color: var(--primary-yellow);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}

.bg-preview {
  width: 100%;
  height: 120px;
  position: relative;
  background-size: 20px 20px;
}

.bg-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  display: flex;
  align-items: end;
}

.bg-name {
  color: var(--text-white);
  font-weight: 600;
  font-size: 0.9rem;
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