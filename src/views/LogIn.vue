<template>
  <div class="auth-container">
    <!-- Overlay container for animation -->
    <div class="forms-wrapper">
      <div class="writeup" :class="{ 'login-active': activeForm === 'login', 'mobile-hidden': isMobile}">
  <div class="writeup-content">
    <!-- Login Writeup -->
    <template v-if="activeForm === 'login'">
      <h2>Welcome Back, Valued Customer!</h2>
      <p>
        Access your personalized shopping dashboard to:
      </p>
      <div class="features">
        <div class="feature-item">
          <span>📦</span> Track your orders in real-time
        </div>
        <div class="feature-item">
          <span>❤️</span> View your saved wishlist
        </div>
        <div class="feature-item">
          <span>⚡</span> Faster checkout with saved details
        </div>
        <div class="feature-item">
          <span>🎁</span> Access exclusive member discounts
        </div>
      </div>
      <p class="trust-badge">
        <span>🔒</span> 256-bit SSL secured login
      </p>
    </template>

    <!-- Signup Writeup -->
    <template v-else>
      <h2>Join Our Shopping Community!</h2>
      <p>
        Create your free account to unlock these benefits:
      </p>
      <div class="features">
        <div class="feature-item">
          <span>🛒</span> Faster checkout process
        </div>
        <div class="feature-item">
          <span>💰</span> First-time buyer discount (10% OFF)
        </div>
        <div class="feature-item">
          <span>📲</span> Order tracking & notifications
        </div>
        <div class="feature-item">
          <span>⭐</span> Earn loyalty points on every purchase
        </div>
      </div>
      <div class="testimonial">
        <p>"Signed up last month and already saved $42 with member discounts!"</p>
        <div class="author">- Jamie R., Gold Member</div>
      </div>
    </template>
  </div>
</div>

      <!-- Signup Form -->
      <div class="signup-form" :class="{ active: activeForm === 'signup' }">
        <h1>{{ activeForm === 'signup' ? 'Join Us Now' : 'Create Your Account' }}</h1>
        <form @submit.prevent="handleSubmit" class="form-content">
          <!-- Your signup form fields here -->
          <div class="form-group">
            <input v-model="formData.username" type="text" placeholder="Username*" required />
          </div>
          <div class="form-group">
            <input v-model="formData.email" type="email" placeholder="Email*" required />
          </div>
          <div class="form-group">
            <input v-model="formData.password" type="password" placeholder="Password*" required />
          </div>
          <div class="form-group">
            <input v-model="formData.first_name" type="text" placeholder="First Name" />
          </div>
          <div class="form-group">
            <input v-model="formData.last_name" type="text" placeholder="Last Name" />
          </div>
          <div class="form-group">
            <input v-model="formData.phone" type="tel" placeholder="Phone Number" />
          </div>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
          </button>
          <p class="toggle-form">
            Already have an account? <a href="#" @click.prevent="toggleForm">Login</a>
          </p>
        </form>
      </div>

      <!-- Login Form -->
      <div class="login-form" :class="{ active: activeForm === 'login' }">
        <h1>Login to Your Account</h1>
        <form @submit.prevent="login" class="form-content">
          <div class="form-group">
            <input v-model="email" type="email" placeholder="Email" required />
          </div>
          <div class="form-group">
            <input v-model="password" type="password" placeholder="Password" required />
          </div>
          <p class="error-message" v-if="error">{{ error }}</p>
          <button type="submit">Login</button>
          <p class="toggle-form">
            No Account Yet? <a href="#" @click.prevent="toggleForm">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()
const activeForm = ref('login')
const email = ref('')
const password = ref('')
const error = ref(null)
const isMobile = ref(false)
const localCart = JSON.parse(localStorage.getItem('cart')) || []

async function syncLocalCart() {
  const localCart = JSON.parse(localStorage.getItem('cart')) || []

  for (const item of localCart) {
    await fetch('/api/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
  }

  localStorage.removeItem('cart')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // Standard mobile breakpoint
}

const toggleForm = () => {
  activeForm.value = activeForm.value === 'login' ? 'signup' : 'login'
}

async function login() {
  error.value = null
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    auth.setToken(data.token)
    await syncLocalCart()
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}

// SignUp Logic

const formData = ref({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  isAdmin: false,
})

const isLoading = ref(false)
const message = ref({ text: '', type: '' })

const handleSubmit = async () => {
  // Basic validation
  if (!formData.value.username || !formData.value.email || !formData.value.password) {
    showMessage('Please fill in all required fields', 'error')
    return
  }

  isLoading.value = true
  message.value = { text: '', type: '' }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    showMessage('Account created successfully! Redirecting to login...', 'success')

    // Reset form
    formData.value = {
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      isAdmin: formData.value.isAdmin ? 1 : 0,
    }

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth#login')
    }, 2000)
  } catch (error) {
    console.error('Signup error:', error)
    showMessage(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const showMessage = (text, type) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 5000)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>


<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to bottom left, #111ed8, #1c0a81);
  color: white;
  padding: 2rem;
  overflow: hidden;
}

.forms-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px; /* Increased to accommodate writeup */
  height: 600px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    max-width: 500px; /* Slimmer for mobile */
  }
}

.writeup {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(50% - 1rem);
  height: 100%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 3;

  @media (max-width: 767px) {
    display: none;
  }
}

.writeup.login-active {
  left: calc(-4% + 1rem);
}

.writeup-content {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.writeup h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.writeup p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.features {
  margin: 1.5rem 0;
}

.feature-item {
  padding: 0.8rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: transform 0.2s;
}

.feature-item:hover {
  transform: translateX(5px);
  background: rgba(255,255,255,0.1);
}

.trust-badge {
  margin-top: 2rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.testimonial {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.08);
  border-left: 3px solid #ff9f43;
  font-style: italic;
}

.author {
  margin-top: 0.5rem;
  font-weight: bold;
  font-size: 0.9rem;
}

.signup-form,
.login-form {
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(50% - 1rem);
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: translateX(0);
  opacity: 1;

  @media (max-width: 767px) {
    width: 100%;
    left: 0;
  }
}

.login-form {
  z-index: 2;
}

.signup-form {
  transform: translateX(100%);
  opacity: 0;
  z-index: 1;
}

.signup-form.active {
  transform: translateX(0);
  opacity: 1;
}
.login-form.active{
  top: 20%;
}
.login-form:not(.active) {
  transform: translateX(-100%);
  opacity: 0;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  display: block;
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
}

button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: white;
  color: #1c0a81;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #f0f0f0;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-form {
  text-align: center;
  margin-top: 1rem;
}

.toggle-form a {
  color: #fff;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
}
</style>