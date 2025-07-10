<template>
  <div class="main-container">
    <!-- Background Canvas for Particle Animation -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- Reset Password Form -->
    <div class="container reset-container">
      <div class="reset-box">
        <h1 class="logo">picpulse</h1>
        <h2 class="reset-title">Reset Password</h2>
        <p class="reset-description">Enter your new password to reset your account</p>

        <form @submit.prevent="handleResetPassword" class="reset-form">
          <div class="form-group password-group">
            <label for="new-password" class="form-label">New Password</label>
            <div class="password-input-container">
              <input
                id="new-password"
                :type="showNewPassword ? 'text' : 'password'"
                v-model="newPassword"
                placeholder="Enter your new password"
                class="form-input password-input"
                required
                aria-describedby="new-password-help"
              />
              <button
                type="button"
                @click="toggleNewPassword"
                class="password-toggle-btn"
                :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showNewPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span id="new-password-help" class="sr-only">Enter your new password</span>
          </div>

          <div class="form-group password-group">
            <label for="confirm-password" class="form-label">Confirm Password</label>
            <div class="password-input-container">
              <input
                id="confirm-password"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                placeholder="Confirm your new password"
                class="form-input password-input"
                required
                aria-describedby="confirm-password-help"
              />
              <button
                type="button"
                @click="toggleConfirmPassword"
                class="password-toggle-btn"
                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showConfirmPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span id="confirm-password-help" class="sr-only">Confirm your new password</span>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

          <button type="submit" class="reset-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner">⌀</span>
            Reset Password
          </button>
        </form>

        <div class="additional-links">
          <p class="login-prompt">
            Back to login?
            <router-link to="/login" class="login-link">Sign In</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const particleCanvas = ref(null);

// Toggle password visibility
const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Handle reset password submission
const handleResetPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {

    // Try to get token from query or from the URL string (for edge cases)
    let token = route.query.token;
    if (!token) {
      // Fallback: try to extract token from full URL
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
    }
    if (!token) {
      errorMessage.value = 'Invalid or missing reset token.';
      return;
    }

    // Send both newPassword and token as query parameters if backend expects both as request parameters
    const response = await axios.post(`http://192.168.1.11:8080/api/user/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword.value)}`);

    successMessage.value = response.data.message || 'Password reset successfully! You can now log in.';
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => {
      router.push('/twibbon-signin');
    }, 2000);
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message || 'Failed to reset password.';
    } else {
      errorMessage.value = 'Unable to connect to the server. Please try again later.';
    }
  } finally {
    isLoading.value = false;
  }
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

      if (this.x < 0 || this.x > canvas.width) {
        this.speedX *= -1;
      }
      if (this.y < 0 || this.y > canvas.height) {
        this.speedY *= -1;
      }
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
  if (particleCanvas.value) {
    initParticles();
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Satisfy&family=Inter:wght@400;500;600;700&family=Tektur:wght@400;500;600;700&display=swap');

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

.reset-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.reset-box {
  background: #222222;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  font-family: 'Tektur', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-white);
  text-transform: lowercase;
  margin-bottom: 1rem;
}

.reset-title {
  font-family: 'Satisfy', cursive;
  font-size: 2.5rem;
  color: var(--text-white);
  margin-bottom: 0.5rem;
}

.reset-description {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--text-gray);
  margin-bottom: 2rem;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  text-align: left;
}

.password-group {
  position: relative;
}

.form-label {
  display: block;
  color: var(--text-white);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-gray);
  border-radius: 0.5rem;
  background: #333333;
  color: var(--text-white);
  font-size: 1rem;
  transition: border 0.3s ease;
}

.form-input:hover,
.form-input:focus {
  border-color: var(--primary-yellow);
  outline: none;
}

.form-input::placeholder {
  color: var(--text-gray);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--text-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.password-toggle-btn:hover {
  color: var(--primary-yellow);
}

.password-toggle-btn:focus {
  outline: 2px solid var(--primary-yellow);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.success-message {
  color: #22c55e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.reset-button {
  width: 100%;
  margin-top: 1rem;
  background: var(--primary-yellow);
  color: var(--bg-dark);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.reset-button:hover:not(:disabled) {
  background: #e0a800;
}

.reset-button:disabled {
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

.additional-links {
  margin-top: 1.5rem;
}

.login-prompt {
  color: var(--text-gray);
  font-size: 0.875rem;
}

.login-link {
  color: var(--primary-yellow);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #e0a800;
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