<template>
  <div class="signup-container">
    <h1>Create Your Account</h1>
    <form @submit.prevent="handleSubmit" class="signup-form">
      <div class="form-group">
        <label for="username">Username*</label>
        <input
          v-model="formData.username"
          type="text"
          id="username"
          required
          placeholder="Enter your username"
        />
      </div>

      <div class="form-group">
        <label for="email">Email*</label>
        <input
          v-model="formData.email"
          type="email"
          id="email"
          required
          placeholder="Enter your email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password*</label>
        <input
          v-model="formData.password"
          type="password"
          id="password"
          required
          placeholder="Create a password"
        />
      </div>

      <div class="form-group">
        <label for="first_name">First Name</label>
        <input
          v-model="formData.first_name"
          type="text"
          id="first_name"
          placeholder="Enter your first name"
        />
      </div>

      <div class="form-group">
        <label for="last_name">Last Name</label>
        <input
          v-model="formData.last_name"
          type="text"
          id="last_name"
          placeholder="Enter your last name"
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input
          v-model="formData.phone"
          type="tel"
          id="phone"
          placeholder="Enter your phone number"
        />
      </div>

      <button type="submit" class="signup-btn" :disabled="isLoading">
        {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
      </button>

      <div v-if="message.text" :class="['message', message.type]">
        {{ message.text }}
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SignupPage',
  setup() {
    const router = useRouter();
    const formData = ref({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      isAdmin: false
    });

    const isLoading = ref(false);
    const message = ref({ text: '', type: '' });

    const handleSubmit = async () => {
      // Basic validation
      if (!formData.value.username || !formData.value.email || !formData.value.password) {
        showMessage('Please fill in all required fields', 'error');
        return;
      }

      isLoading.value = true;
      message.value = { text: '', type: '' };

      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData.value)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        showMessage('Account created successfully! Redirecting to login...', 'success');
        
        // Reset form
        formData.value = {
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          phone: '',
          isAdmin: formData.value.isAdmin ? 1 : 0
        };

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } catch (error) {
        console.error('Signup error:', error);
        showMessage(error.message, 'error');
      } finally {
        isLoading.value = false;
      }
    };

    const showMessage = (text, type) => {
      message.value = { text, type };
      setTimeout(() => {
        message.value = { text: '', type: '' };
      }, 5000);
    };

    return {
      formData,
      isLoading,
      message,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="tel"]:focus {
  border-color: #4CAF50;
  outline: none;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.checkbox-group input {
  margin-right: 0.5rem;
}

.signup-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.signup-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.signup-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 480px) {
  .signup-container {
    padding: 1rem;
    margin: 1rem;
  }
}
</style>