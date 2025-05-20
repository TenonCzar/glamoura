<template>
  <div class="bg-white text-[#162456]">
    <!-- Header -->
    <header
      class="bg-white shadow-md text-gray-800 spinnaker px-12 py-4 flex justify-between items-center"
    >
      <div class="text-2xl font-bold">
        Glamoura <span class="text-sm text-indigo-900">by Oli</span>
      </div>
      <nav class="hidden lg:flex lg:gap-12 text-gray-700">
        <a href="#">Shop</a>
        <a href="#">Categories</a>
        <a href="#">Deals</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>
      <div class="flex gap-4 items-center">
        <!-- <button><Search class="i-lucide-search" /></button> -->
        <Router-link to="/auth#signup" class="hidden lg:block text-orange-400 hover:text-blue-400"
          ><user class="i-lucide-user"
        /></Router-link>
        <Cart />
        <button class="text-orange-400 hover:text-blue-400"><Heart :size="20" /></button>
        <div class="relative">
          <Menu class="lg:hidden w-fit cursor-pointer" title="menu" @click="openNav" />
          <div v-if="mobileNav" @click="openNav" class="mobile-links bg-white absolute top-10 -right-12 w-[50vw] h-[50vh] px-6 py-8 transition-all">
            <nav class="flex flex-col gap-4 h-[40vh] text-2xl justify-between text-right">
              <Router-link to="/auth">Login</Router-link>
              <Router-link to="#">Categories</Router-link>
              <!-- <Router-link to="#">Deals</Router-link> -->
              <Router-link to=".about">About</Router-link>
              <Router-link to="/contact">Contact</Router-link>
            </nav>
          </div>
        </div>
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

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import Categories from '/src/views/Admin/components/Categories.vue'
import Featured from '/src/views/Admin/components/Featured.vue'
import NewArrivals from '/src/views/Admin/components/NewArrivals.vue'
import BestSellers from '/src/views/Admin/components/BestSellers.vue'
import OurValues from '/src/views/Admin/components/OurValues.vue'
import Blog from '/src/views/Admin/components/Blog.vue'
import NewsLetter from '/src/views/Admin/components/NewsLetter.vue'
import Footer from './Admin/components/Footer.vue'
import Cart from '/src/views/Users/components/MinimalCart.vue'
import { Heart } from 'lucide-vue-next'
// const isLoading = ref(true)

const cartCount = ref(0)
const mobileNav = ref(false)

const openNav = () => {
  mobileNav.value = !mobileNav.value
}

// Function to calculate total quantity in cart
const calculateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  return cart.reduce((total, item) => total + item.quantity, 0)
}

// Initialize count on component mount
cartCount.value = calculateCartCount()

// Watch localStorage changes (optional but nice)
window.addEventListener('storage', () => {
  cartCount.value = calculateCartCount()
})
</script>
