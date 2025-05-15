<template>
  <div class="bg-white text-[#162456]">
    <!-- Header -->
    <header
      class="bg-white shadow-md text-gray-800 spinnaker px-12 py-4 flex justify-between items-center"
    >
      <div class="text-2xl font-bold">
        Glamoura <span class="text-sm text-indigo-900">by Oli</span>
      </div>
      <nav class="hidden md:flex gap-12 text-gray-700">
        <a href="#">Shop</a>
        <a href="#">Categories</a>
        <a href="#">Deals</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>
      <div class="flex gap-4 items-center">
        <button><Search class="i-lucide-search" /></button>
        <button><user class="i-lucide-user" /></button>
        <button>
          <Shopping-cart :size="20" class="text-orange-400" />
        </button>
        <button><Heart :size="20" class="text-orange-400" /></button>
      </div>

      <!-- <div class="shopy flex flex-row-reverse gap-4 w-fit bg-red-200">
        <div class="auth px-6 flex gap-4 w-fit">
          <routerlink to="/auth">Login</routerlink>
          <routerlink to="/auth">Signup</routerlink>
        </div>
      </div> -->
    </header>

    <!-- Topbar -->
    <div class="bg-black text-white text-sm px-4 py-2 flex justify-between items-center">
      <p>🚚 Free shipping on orders over $50</p>
      <div class="flex gap-3">
        <select class="bg-black text-white">
          <option>EN</option>
          <option>FR</option>
        </select>
        <select class="bg-black text-white">
          <option>USD</option>
          <option>EUR</option>
        </select>
      </div>
    </div>

    <!-- Hero Banner -->
    <section
      class="flex flex-col gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-6 text-center"
    >
      <h1 class="text-4xl md:text-6xl font-bold mb-4">Shop the Latest Trends</h1>
      <p class="text-lg md:text-xl mb-6">Discover top styles curated just for you</p>
      <button
        class="bg-white text-indigo-600 w-[200px] mx-auto place-self-center px-6 py-2 rounded-full font-semibold"
      >
        Shop Now
      </button>
    </section>

    <!-- Category Grid -->
    <Categories />

    <!-- Featured Products -->

    <Featured />

    <!-- New Arrivals -->
    <NewArrivals />

    <!-- Best Sellers -->
    <BestSellers />

    <!-- Our Values -->
    <OurValues />
    <!-- Our Blog -->
    <Blog />
    <!-- Our NewsLetter -->
    <NewsLetter />

    <!-- Cart -->
     <Cart />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Categories from '@/views/Admin/components/Categories.vue'
import Featured from '@/views/Admin/components/Featured.vue'
import NewArrivals from '@/views/Admin/components/NewArrivals.vue'
import BestSellers from '@/views/Admin/components/BestSellers.vue'
import OurValues from '@/views/Admin/components/OurValues.vue'
import Blog from '@/views/Admin/components/Blog.vue'
import NewsLetter from '@/views/Admin/components/NewsLetter.vue'
import Footer from './Admin/components/Footer.vue'
import Cart from './Admin/components/Cart.vue'
import { Heart } from 'lucide-vue-next'
// const isLoading = ref(true)
</script>
