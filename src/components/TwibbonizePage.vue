<template>
  <div class="main-container">
    <!-- Background Canvas for Particle Animation -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="container flex justify-between items-center">
        <h1 class="logo">picpulse</h1>
        <div class="nav-links">
          <div class="search-bar">
            <input type="text" placeholder="Search" class="search-input" />
            <span class="search-icon">🔍</span>
          </div>
          <button @click="openModal" class="start-campaign">+ Start a Campaign</button>
        </div>
      </div>
    </nav>

    <!-- Modal Popup -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeModal" class="close-button">✖</button>
        <h2 class="modal-title">Start Your Campaign</h2>
        <p class="modal-description">Create a campaign or design a custom frame to engage your audience.</p>
        <div class="modal-options">
          <!-- Campaign Creation Option -->
          <div class="option-card" @click="createCampaign" role="button" tabindex="0" @keydown.enter="createCampaign" aria-label="Create Campaign">
            <div class="option-icon new-badge">
              <span>📢</span>
              <span class="new-label">NEW!</span>
            </div>
            <h3>Campaign</h3>
            <p>Create a campaign with a unique background for your supporters.</p>
          </div>
          <!-- Twibbon Frames Option -->
          <div class="option-card" @click="createFrameTwibbon" role="button" tabindex="0" @keydown.enter="createFrameTwibbon" aria-label="Create Twibbon Frames">
            <div class="option-icon">
              <span>🖼️</span>
            </div>
            <h3>Frames</h3>
            <p>Design a custom frame to overlay on supporter photos.</p>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="closeModal" class="cancel-button">Cancel</button>
          <button @click="proceedWithSelection" class="get-started-button">Get Started</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container content">
      <div class="hero-section">
        <div class="hero-text">
          <h1 class="hero-title">show your support</h1>
          <p class="hero-description">
            Turn your passion into action; create custom images that show what you stand for and invite friends to join you
          </p>
          <button @click="openModal" class="start-campaign-btn">+ Start a Campaign</button>
        </div>
        <div class="campaign-grid">
          <div v-for="campaign in campaigns" :key="campaign.id"
               class="campaign-card"
               @click="selectCampaign(campaign)"
               @keydown.enter="selectCampaign(campaign)"
               tabindex="0"
               role="button"
               :aria-label="`Select ${campaign.name} campaign`">
            <div class="campaign-preview">
              <div class="campaign-inner">
                <span class="campaign-icon">📢</span>
              </div>
            </div>
            <h3 class="campaign-title">{{ campaign.name }}</h3>
            <p class="campaign-description">{{ campaign.description }}</p>
          </div>
        </div>
      </div>

      <!-- Photo Upload and Preview -->
      <div v-if="selectedCampaign" class="upload-section">
        <h2 class="section-title">Join {{ selectedCampaign.name }}</h2>
        <div class="upload-preview">
          <div class="upload-area">
            <label for="photo-upload" class="upload-label">Upload Your Photo</label>
            <input id="photo-upload" type="file" accept="image/*" @change="handleFileUpload"
                   class="upload-input" aria-describedby="upload-help">
            <span id="upload-help" class="sr-only">Upload an image to join the campaign</span>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <button @click="previewPhoto" :disabled="!userPhoto || isLoading" class="apply-button">
              <span v-if="isLoading" class="spinner">⌀</span>
              Preview Photo
            </button>
          </div>
          <div class="preview-area">
            <canvas ref="canvas" class="preview-canvas"></canvas>
            <button v-if="resultImage" @click="downloadImage" class="download-button">
              Download Image
            </button>
          </div>
        </div>
        <button @click="goBack" class="back-button">
          Back to Campaigns
        </button>
      </div>

      <!-- Trending Section -->
      <div v-if="!selectedCampaign" class="trending-section">
        <h2 class="trending-title">Trending</h2>
        <a href="#" class="explore-more">Explore More ➔</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const selectedCampaign = ref(null);
const userPhoto = ref(null);
const canvas = ref(null);
const particleCanvas = ref(null);
const resultImage = ref(null);
const errorMessage = ref('');
const isLoading = ref(false);

// Modal State
const showModal = ref(false);
const selectedOption = ref(null);

const openModal = () => {
  showModal.value = true;
  selectedOption.value = null;
};

const closeModal = () => {
  showModal.value = false;
  selectedOption.value = null;
};

const createCampaign = () => {
  selectedOption.value = 'campaign';
};

const createFrameTwibbon = () => {
  selectedOption.value = 'frame';
};

const proceedWithSelection = () => {
  if (!selectedOption.value) {
    alert('Please select an option to proceed.');
    return;
  }
  if (selectedOption.value === 'frame') {
    router.push('/twibbon-frames');
  } else if (selectedOption.value === 'campaign') {
    router.push('/twibbon-bg');
  } else {
    console.log('Proceeding with campaign creation...');
    closeModal();
  }
};

const selectCampaign = (campaign) => {
  selectedCampaign.value = campaign;
  errorMessage.value = '';
  userPhoto.value = null;
  resultImage.value = null;
};

const goBack = () => {
  selectedCampaign.value = null;
  errorMessage.value = '';
  userPhoto.value = null;
  resultImage.value = null;
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
      console.log('Image loaded successfully');
    };
    userPhoto.value.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const previewPhoto = () => {
  if (!userPhoto.value || !canvas.value || !userPhoto.value.complete) {
    errorMessage.value = 'Please upload a valid image.';
    return;
  }

  isLoading.value = true;

  try {
    const ctx = canvas.value.getContext('2d');
    const img = userPhoto.value;

    const canvasWidth = img.width;
    const canvasHeight = img.height;
    canvas.value.width = canvasWidth;
    canvas.value.height = canvasHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    resultImage.value = canvas.value.toDataURL('image/png');
    isLoading.value = false;
  } catch (error) {
    errorMessage.value = 'Failed to process image.';
    isLoading.value = false;
  }
};

const downloadImage = () => {
  if (!resultImage.value) return;

  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = `campaign-${selectedCampaign.value.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Particle Animation Logic
const initParticles = () => {
  const canvas = particleCanvas.value;
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  const numberOfParticles = 50;

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 5 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.size > 0.2) this.size -= 0.01;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.fillStyle = 'rgba(255, 193, 7, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Initialize particles
  const init = () => {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  };
  init();

  // Connect particles with lines
  const connectParticles = () => {
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.strokeStyle = `rgba(255, 193, 7, ${1 - distance / 100})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  };

  // Animation loop
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
      if (particlesArray[i].size <= 0.2) {
        particlesArray.splice(i, 1);
        i--;
        particlesArray.push(new Particle());
      }
    }
    connectParticles();
    requestAnimationFrame(animate);
  };
  animate();
};

onMounted(() => {
  // Initialize preview canvas
  if (canvas.value) {
    canvas.value.width = 500;
    canvas.value.height = 500;

    const ctx = canvas.value.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Preview will appear here', 250, 250);
  }

  // Initialize particle animation
  if (particleCanvas.value) {
    initParticles();
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-yellow: #FFC107;
  --bg-dark: #1A1A1A;
  --text-white: #FFFFFF;
  --text-gray: #B0B0B0;
  --border-gray: #333333;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-dark);
  color: var(--text-white);
  min-height: 100vh;
  overflow-x: hidden;
}

.main-container {
  min-height: 100vh;
  background: transparent;
  position: relative;
}

.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  position: relative;
  z-index: 1;
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
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(5px);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-white);
  text-transform: lowercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: 9999px;
  background: var(--border-gray);
  border: none;
  color: var(--text-white);
  font-size: 1rem;
  width: 200px;
}

.search-input::placeholder {
  color: var(--text-gray);
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-gray);
}

.start-campaign {
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.3s ease;
}

.start-campaign:hover {
  background: #e0a800;
}

.hero-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
}

@media (min-width: 1024px) {
  .hero-section {
    flex-direction: row;
    align-items: center;
  }
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-family: 'Satisfy', cursive;
  font-size: 3.5rem;
  color: var(--text-white);
  line-height: 1.2;
  margin-bottom: 1rem;
  text-transform: lowercase;
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 5rem;
  }
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  color: var(--text-gray);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 500px;
}

.start-campaign-btn {
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.start-campaign-btn:hover {
  background: #e0a800;
}

.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.campaign-card {
  background: #222222;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.campaign-card:hover {
  transform: scale(1.05);
}

.campaign-card:focus {
  outline: 2px solid var(--primary-yellow);
  outline-offset: 2px;
}

.campaign-preview {
  width: 100%;
  height: 10rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333333;
  position: relative;
  overflow: hidden;
}

.campaign-inner {
  width: 80%;
  height: 80%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.campaign-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}

.campaign-title {
  font-family: 'Inter', sans-serif;
  color: var(--text-white);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.campaign-description {
  font-family: 'Inter', sans-serif;
  color: var(--text-gray);
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upload-section {
  background: #222222;
  border-radius: 0.5rem;
  padding: 2rem;
  margin-top: 2rem;
}

.section-title {
  font-family: 'Inter', sans-serif;
  color: var(--text-white);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .upload-preview {
    flex-direction: row;
  }
}

.upload-area,
.preview-area {
  flex: 1;
}

.upload-label {
  display: block;
  color: var(--text-white);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.upload-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-gray);
  border-radius: 0.5rem;
  background: #333333;
  color: var(--text-white);
  font-size: 1rem;
  transition: border 0.3s ease;
}

.upload-input:hover,
.upload-input:focus {
  border-color: var(--primary-yellow);
  outline: none;
}

.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.apply-button {
  width: 100%;
  margin-top: 1.5rem;
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.apply-button:hover:not(:disabled) {
  background: #e0a800;
}

.apply-button:disabled {
  background: var(--border-gray);
  cursor: not-allowed;
  opacity: 0.6;
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.preview-canvas {
  width: 100%;
  max-width: 32rem;
  border: 1px solid var(--border-gray);
  border-radius: 0.5rem;
  background: #333333;
}

.download-button {
  width: 100%;
  margin-top: 1.5rem;
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.download-button:hover {
  background: #e0a800;
}

.back-button {
  margin-top: 2rem;
  color: var(--primary-yellow);
  font-size: 1rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.back-button:hover {
  color: #e0a800;
}

.trending-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 17rem;
  padding: 1rem 0;
}

.trending-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-white);
}

.explore-more {
  font-family: 'Inter', sans-serif;
  color: var(--text-gray);
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.explore-more:hover {
  color: var(--primary-yellow);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: #222222;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-gray);
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--text-white);
}

.modal-title {
  font-family: 'Inter', sans-serif;
  color: var(--text-white);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
}

.modal-description {
  font-family: 'Inter', sans-serif;
  color: var(--text-gray);
  font-size: 1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.modal-options {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
}

@media (max-width: 640px) {
  .modal-options {
    flex-direction: column;
  }
}

.option-card {
  flex: 1;
  max-width: 300px;
  background: #333333;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
}

.option-card:hover {
  transform: scale(1.05);
  background: #444444;
}

.option-card:focus {
  outline: 2px solid var(--primary-yellow);
  outline-offset: 2px;
}

.option-icon {
  width: 60px;
  height: 60px;
  background: #555555;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  position: relative;
}

.option-icon span {
  font-size: 2rem;
}

.new-badge {
  position: relative;
}

.new-label {
  position: absolute;
  top: -10px;
  right: -30px;
  background: #00C4B4;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  transform: rotate(45deg);
}

.option-card h3 {
  font-family: 'Inter', sans-serif;
  color: var(--text-white);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.option-card p {
  font-family: 'Inter', sans-serif;
  color: var(--text-gray);
  font-size: 0.875rem;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.cancel-button,
.get-started-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cancel-button {
  background: none;
  border: 1px solid var(--border-gray);
  color: var(--text-gray);
}

.cancel-button:hover {
  background: #333333;
}

.get-started-button {
  background: var(--primary-yellow);
  border: none;
  color: var(--bg-dark);
}

.get-started-button:hover {
  background: #e0a800;
}
</style>