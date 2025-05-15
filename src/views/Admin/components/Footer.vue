<template>
    <footer class="bg-black text-white px-12 py-12 flex flex-col gap-6">
      <div class="grid md:grid-cols-4 gap-6">
        <div class="space-y-3 flex flex-col gap-4">
          <h3 class="font-bold text-2xl mb-3">Shop</h3>
          <ul class="space-y-2 text-lg text-gray-300 flex flex-col gap-2">
            <li><a href="#" class="hover:underline">Men</a></li>
            <li><a href="#" class="hover:underline">Women</a></li>
            <li><a href="#" class="hover:underline">Accessories</a></li>
            <li><a href="#" class="hover:underline">Sale</a></li>
          </ul>
        </div>
        <div class="space-y-3 flex flex-col gap-4">
          <h3 class="font-bold text-2xl mb-3">Company</h3>
          <ul class="space-y-2 text-lg text-gray-300  flex flex-col gap-2">
            <li><a href="#" class="hover:underline">About Us</a></li>
            <li><a href="#" class="hover:underline">Careers</a></li>
            <li><a href="#" class="hover:underline">Blog</a></li>
          </ul>
        </div>
        <div class="space-y-3 flex flex-col gap-4">
          <h3 class="font-bold text-2xl mb-3">Support</h3>
          <ul class="space-y-2 text-lg text-gray-300  flex flex-col gap-2">
            <li><a href="#" class="hover:underline">Help Center</a></li>
            <li><a href="#" class="hover:underline">Returns</a></li>
            <li><a href="#" class="hover:underline">Shipping Info</a></li>
          </ul>
        </div>
        <div class="space-y-3 flex flex-col gap-4">
          <h3 class="font-bold text-2xl mb-3">Newsletter</h3>
          <form @submit.prevent class="space-y-3 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Your email"
              class="w-full px-3 py-2 rounded text-gray-200 border"
            />
            <button class="w-full bg-indigo-600 py-2 rounded font-semibold hover:bg-indigo-500">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div class="mt-12 text-center text-lg text-gray-400">
        &copy; 2025 Glamoura by Oli. All rights reserved.
      </div>
    </footer>
  </template>
  
  <script setup>
  // No JS needed here unless you want form logic
  </script>
  