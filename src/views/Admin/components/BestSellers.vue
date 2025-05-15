<template>
    <section class="px-6 py-12">
      <h2 class="text-2xl font-bold mb-6">Best Sellers</h2>
      <div class="flex gap-6 overflow-x-auto pb-4">
        <div
          v-for="item in bestSellers"
          :key="item.id"
          class="min-w-[200px] bg-white p-4 rounded shadow-sm hover:shadow-md"
        >
          <img :src="item.image" class="mb-2 rounded" />
          <h3 class="font-medium">{{ item.name }}</h3>
          <p class="text-indigo-600 font-bold">₦{{ item.price }}</p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  const bestSellers = [
    { id: 1, name: 'Minimalist Watch', image: '/src/assets/IMG-4.jpg', price: 99 },
    { id: 2, name: 'Running Shoes', image: '/src/assets/IMG-5.jpg', price: 110 },
    { id: 3, name: 'Beanie Hat', image: '/src/assets/IMG-1.jpg', price: 25 },
    { id: 4, name: 'Classic T-shirt', image: '/src/assets/IMG-2.jpg', price: 35 }
  ]
  </script>