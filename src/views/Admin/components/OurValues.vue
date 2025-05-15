<template>
    <section class="px-6 py-12 text-gray-200 bg-[#808080]">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div v-for="value in values" :key="value.title" class="space-y-3">
          <div class="text-indigo-400 text-4xl">{{ value.icon }}</div>
          <h3 class="text-lg font-semibold">{{ value.title }}</h3>
          <p class="text-gray-200 text-sm">{{ value.description }}</p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  const values = [
    { title: 'Fast Delivery', description: 'We ship within 24 hours.', icon: '🚀' },
    { title: '24/7 Support', description: 'Customer support anytime.', icon: '💬' },
    { title: 'Money Back', description: '30-day refund guarantee.', icon: '💰' }
  ]
  </script>
  