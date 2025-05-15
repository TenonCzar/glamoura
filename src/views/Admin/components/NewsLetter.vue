<template>
    <section class="flex flex-col gap-4 bg-indigo-600 text-white px-6 py-12 text-center">
      <h2 class="text-3xl mb-4">Stay in the Loop</h2>
      <p class="mb-6 text-sm">Get updates on new drops, sales, and more.</p>
      <form @submit.prevent="subscribe" class="flex place-self-center gap-2 w-full max-w-[400px] mx-auto">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          class="rounded px-4 py-2 w-full text-black border border-white outline-none"
        />
        <button type="submit" class="bg-white text-indigo-600 px-4 py-2 rounded font-semibold">Subscribe</button>
      </form>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  const email = ref('')
  
  const subscribe = () => {
    if (email.value) {
      alert(`Subscribed with ${email.value}! 🎉`)
      email.value = ''
    }
  }
  </script>
  