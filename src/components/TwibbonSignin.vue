<template>
  <div class="main-container">
    <!-- Background Canvas for Particle Animation -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- Login Form -->
    <div class="container login-container">
      <div class="login-box">
        <h1 class="logo">picpulse</h1>
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-description">Sign in to create and join campaigns</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              class="form-input"
              required
              aria-describedby="email-help"
            />
            <span id="email-help" class="sr-only">Enter your email address to sign in</span>
          </div>

          <div class="form-group password-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-container">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Enter your password"
                class="form-input password-input"
                required
                aria-describedby="password-help"
              />
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span id="password-help" class="sr-only">Enter your password to sign in</span>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner">⌀</span>
            Sign In
          </button>
        </form>

        <div class="additional-links">
          <a href="#" @click.prevent="showForgotPasswordPopup" class="forgot-password">Forgot Password?</a>
          <p class="signup-prompt">
            Don't have an account?
            <router-link to="/" class="signup-link">Sign Up</router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Forgot Password Popup -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-container">
        <div class="popup-header">
          <h2 class="popup-title">Reset Password</h2>
          <button @click="closePopup" class="close-button" aria-label="Close popup">
            <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p class="popup-description">Enter your email address to receive a password reset link.</p>
        <form @submit.prevent="handleForgotPassword" class="popup-form">
          <div class="form-group">
            <label for="reset-email" class="form-label">Email</label>
            <input
              id="reset-email"
              type="email"
              v-model="resetEmail"
              placeholder="Enter your email"
              class="form-input"
              required
              aria-describedby="reset-email-help"
            />
            <span id="reset-email-help" class="sr-only">Enter your email address to reset your password</span>
          </div>
          <p v-if="popupMessage" :class="isPopupSuccess ? 'success-message' : 'error-message'">{{ popupMessage }}</p>
          <button type="submit" class="popup-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner">⌀</span>
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const particleCanvas = ref(null);
const showPopup = ref(false);
const resetEmail = ref('');
const popupMessage = ref('');
const isPopupSuccess = ref(false);

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Show forgot password popup
const showForgotPasswordPopup = () => {
  showPopup.value = true;
  resetEmail.value = '';
  popupMessage.value = '';
  isPopupSuccess.value = false;
};

// Close popup
const closePopup = () => {
  showPopup.value = false;
  resetEmail.value = '';
  popupMessage.value = '';
  isPopupSuccess.value = false;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Handle forgot password submission
const handleForgotPassword = async () => {
  if (!resetEmail.value) {
    popupMessage.value = 'Please enter your email address.';
    return;
  }

  if (!isValidEmail(resetEmail.value)) {
    popupMessage.value = 'Please enter a valid email address.';
    return;
  }

  isLoading.value = true;
  popupMessage.value = '';
  isPopupSuccess.value = false;

  try {
    const response = await axios.post(
      `http://192.168.1.5:8080/api/user/auth/forgot-password?email=${encodeURIComponent(resetEmail.value)}`,
      {}, // Empty body since email is sent as query parameter
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Display the message from the backend
    popupMessage.value = response.data.message || 'Password reset link sent to your email.';
    isPopupSuccess.value = true;

    // Close popup after 3 seconds
    setTimeout(() => {
      closePopup();
    }, 3000);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 403) {
        popupMessage.value = error.response.data.message || 'Access denied. Please check server permissions or CORS settings.';
      } else {
        popupMessage.value = error.response.data.message || 'Failed to send reset link.';
      }
    } else if (error.request) {
      popupMessage.value = 'Unable to connect to the server. Please check your network or server status.';
    } else {
      popupMessage.value = 'An error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Handle login submission
const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post('http://192.168.1.5:8080/api/user/auth/login', {
      email: email.value,
      password: password.value,
    });

    const { token } = response.data;
    if (token) {
      sessionStorage.setItem('authToken', token);
      router.push('/twibbon-page');
    } else {
      errorMessage.value = 'No token received from server.';
    }
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message || 'Invalid email or password.';
    } else if (error.request) {
      errorMessage.value = 'Unable to connect to the server. Please try again later.';
    } else {
      errorMessage.value = 'Login failed. Please try again.';
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

.login-container {
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

.login-box {
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

.login-title {
  font-family: 'Satisfy', cursive;
  font-size: 2.5rem;
  color: var(--text-white);
  margin-bottom: 0.5rem;
}

.login-description {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--text-gray);
  margin-bottom: 2rem;
}

.login-form {
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
  color: #10B981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.login-button {
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

.login-button:hover:not(:disabled) {
  background: #e0a800;
}

.login-button:disabled {
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

.forgot-password {
  display: block;
  color: var(--text-gray);
  font-size: 0.875rem;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--primary-yellow);
}

.signup-prompt {
  color: var(--text-gray);
  font-size: 0.875rem;
}

.signup-link {
  color: var(--primary-yellow);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.signup-link:hover {
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

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-container {
  background: #222222;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  position: relative;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.popup-title {
  font-family: 'Satisfy', cursive;
  font-size: 2rem;
  color: var(--text-white);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-gray);
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--primary-yellow);
}

.close-button:focus {
  outline: 2px solid var(--primary-yellow);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2;
}

.popup-description {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--text-gray);
  margin-bottom: 1.5rem;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.popup-button {
  width: 100%;
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

.popup-button:hover:not(:disabled) {
  background: #e0a800;
}

.popup-button:disabled {
  background: var(--border-gray);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>