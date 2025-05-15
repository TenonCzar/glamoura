<template>
  <div class="max-w-md mx-auto mt-10 p-4">
    <!-- Passcode Gate -->
    <div v-if="!passcodeAccepted" class="space-y-4">
      <h2 class="text-xl font-bold">Enter Admin Passcode</h2>
      <input
        v-model="passcode"
        type="password"
        placeholder="Secret Passcode"
        class="w-full border p-2 rounded" autofocus
      />
      <button
        @click="verifyPasscode"
        class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
      <p class="text-red-500" v-if="error">{{ error }}</p>
    </div>

    <!-- Admin Signup Form -->
    <form v-else @submit.prevent="submitForm" class="space-y-4">
      <h2 class="text-xl font-bold">Admin Signup</h2>
      <input v-model="form.username" placeholder="Username" class="w-full border p-2 rounded" required />
      <input v-model="form.email" type="email" placeholder="Email" class="w-full border p-2 rounded" required />
      <input v-model="form.password" type="password" placeholder="Password" class="w-full border p-2 rounded" required />
      <input v-model="form.first_name" placeholder="First Name" class="w-full border p-2 rounded" />
      <input v-model="form.last_name" placeholder="Last Name" class="w-full border p-2 rounded" />
      <input v-model="form.phone" placeholder="Phone" class="w-full border p-2 rounded" />
      <input v-model="form.avatar_url" placeholder="Avatar URL" class="w-full border p-2 rounded" />
      <!-- Admin Role Dropdown -->
<select v-model="form.admin_role" class="w-full border p-2 rounded">
  <option disabled value="">Select Admin Role</option>
  <option value="super_admin">Super Admin</option>
  <option value="inventory_manager">Inventory Manager</option>
  <option value="order_manager">Order Manager</option>
  <option value="customer_support">Customer Support</option>
  <option value="marketing">Marketing</option>
</select>

<!-- Department Dropdown -->
<select v-model="form.department" class="w-full border p-2 rounded">
  <option disabled value="">Select Department</option>
  <option value="inventory">Inventory</option>
  <option value="orders">Orders</option>
  <option value="support">Support</option>
  <option value="marketing">Marketing</option>
</select>
      <button
        type="submit"
        class="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
      >
        Register Admin
      </button>
      <p class="text-green-600" v-if="successMessage">{{ successMessage }}</p>
      <p class="text-red-500" v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const passcode = ref('');
const passcodeAccepted = ref(false);
const error = ref('');
const successMessage = ref('');

 // 🔐 Change this to your real admin passcode

const form = ref({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  avatar_url: '',
  admin_role: '',
  department: '',
});

const verifyPasscode = async () => {
  const res = await fetch('/api/adminpin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: passcode.value }),
  });

  const data = await res.json();
  if (data.success) {
    passcodeAccepted.value = true;
  } else {
    alert('Invalid access pin!');
  }
};

async function submitForm() {
  try {
    const res = await fetch('/api/createadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (data.success) {
      successMessage.value = 'Admin registered successfully!';
      error.value = '';
    } else {
      error.value = data.error;
    }
  } catch (err) {
    error.value = 'Something went wrong!';
  }
}
</script>
