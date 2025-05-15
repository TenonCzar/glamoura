<template>
    <section class="px-6 py-12 flex flex-col gap-6 place-self-center">
      <h2 class="text-3xl font-bold mb-6">From Our Blog</h2>
      <div class="flex gap-6 flex-wrap justify-between">
        <div v-for="post in posts" :key="post.id" class="flex gap-6 bg-white  w-[300px] p-4 border rounded hover:shadow">
          <img :src="post.image" class="mb-3 rounded h-[200px]" />
          <div class="detail flex flex-col justify-center">
          <h3 class="font-semibold text-lg mb-1">{{ post.title }}</h3>
          <p class="text-gray-600 text-sm">{{ post.snippet }}</p>
          <button class="mt-3 text-indigo-600 font-medium hover:underline">Read More</button>
        </div></div>
      </div>
    </section>
  </template>
  
  <script setup>
  const posts = [
    {
      id: 1,
      title: 'Top 10 Trends This Season',
      image: '/src/assets/IMG-1.jpg',
      snippet: 'Find out what styles are blowing up in 2025...'
    },
    {
      id: 2,
      title: 'How to Pick the Right Sneakers',
      image: '/src/assets/IMG-2.jpg',
      snippet: 'Comfort meets style. Learn how to choose your next pair.'
    },
    {
      id: 3,
      title: 'The Minimalist Wardrobe',
      image: '/src/assets/IMG-3.jpg',
      snippet: 'Build a clean, clutter-free closet with these tips.'
    }
  ]
  </script>
  