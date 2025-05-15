<template>
    <div
      v-if="cartItems.length"
      class="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50"
    >
      <span>{{ cartItems.length }} item(s) in cart</span>
      <button
        @click="goToCart"
        class="bg-white text-indigo-600 font-bold px-3 py-1 rounded hover:bg-gray-100"
      >
        View Cart
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const cartItems = ref([
    { id: 1, name: 'Minimalist Tee' },
    { id: 2, name: 'Running Shoes' }
  ])
  
  const goToCart = () => {
    alert('Redirecting to cart page...')
  }
  </script>
  