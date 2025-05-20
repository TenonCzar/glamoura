<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Cart from '/src/views/Users/components/MinimalCart.vue'
import Rating from './Rating.vue'
import BestSeller from '/src/views/Admin/components/BestSellers.vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

const modules = [Autoplay, Pagination, Navigation]

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const responseDisplayer = ref(null)

const STORAGE_KEY_PREFIX = 'preview_product_'

async function fetchProduct(slug) {
  const res = await fetch(`/api/products/${slug}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'No product found')
  return data.product
}

const actualPrice = computed(() =>{
  return product.value ? Number(product.value.price) : 0
})
const discount = computed(() => {
  return product.value ? Number(product.value.compare_at_price) : 0
})
const discountedPrice = computed(() => {
  // Example: 10% off
  return Math.round(((discount.value - actualPrice.value) / discount.value) * 100)
                  
})

const addToCart = async (product) => {
  try {
    const isLoggedIn = false
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    const existingIndex = cart.findIndex(
      item =>
        item.product_id === product.id &&
        (item.variant_id || null) === (product.variant_id || null)
    )

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images.length ? product.images[0].image_url : '/placeholder.png',
        variant_id: product.variant_id || null,
        quantity: 1,
        price: product.price,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))

    if (isLoggedIn) {
      const res = await fetch('/api/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: product.variant_id || null,
          quantity: 1,
          price: product.price,
        }),
      })
      const data = await res.json()
      if (data.success) {
        responseDisplayer.value.showSuccess('Added To Cart')
      } else {
        responseDisplayer.value.showError('Failed to add to cart backend')
      }
    } else {
      responseDisplayer.value.showSuccess('Added To Cart. Login To Checkout')
    }
  } catch (err) {
    responseDisplayer.value.showError('Error adding to cart: ' + err.message)
  }
}

onMounted(async () => {
  const slug = route.params.slug
  const cacheKey = STORAGE_KEY_PREFIX + slug

  // Load cached version immediately (if any)
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      product.value = JSON.parse(cached)
    } catch {
      localStorage.removeItem(cacheKey)
    }
  }

  // Start fetching updated data silently in the background
  try {
    const freshProduct = await fetchProduct(slug)

    // Compare with cached (basic shallow comparison by ID and timestamps if available)
    const isDifferent =
      !cached || JSON.stringify(freshProduct) !== cached

    if (isDifferent) {
      product.value = freshProduct // update UI silently
      localStorage.setItem(cacheKey, JSON.stringify(freshProduct))
    }
  } catch (err) {
    console.error('Error fetching fresh product:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white min-h-screen text-gray-800">
    <header class="bg-gray-800 text-white flex item-center justify-between py-4 px-4">
      <div class="flex gap-3 items-center"><router-link to="/"><Arrow-left /></router-link> Details</div>
      <div class="flex gap-3 items-center"><Cart class="text-gray-800" /> <Menu /></div>
    </header> 
  <ResponseDisplayer ref="responseDisplayer" />
  <section class="p-6 bg-white text-gray-800">
    <div v-if="loading">Loading...</div>

    <div v-else-if="product" class="flex flex-col gap-4 p-4 lg:flex-row max-w-[90%] place-self-center justify-between">
      <Swiper
      :modules="modules"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :navigation="true"
        class="w-full max-w-[500px] h-auto my-4 rounded"
      >
        <SwiperSlide
          v-for="(img, index) in product.images"
          :key="index" class="rounded"
        >
          <img
            :src="img.image_url"
            :alt="img.alt_text || product.name"
            class="w-full h-auto rounded"
            />
          </SwiperSlide>
        </Swiper>
        <div class="flex flex-col gap-4 md:max-w-[300px] mt-6">
          <h1 class="text-2xl font-bold mt-4">{{ product.name }}</h1>
          <p class="text-indigo-600 text-2xl font-semibold mt-4 flex items-center gap-3">₦{{ product.price }} <span class="text-xs line-through">₦{{ product.compare_at_price }}</span> <span class="discount text-xs text-orange-500 bg-orange-100">-{{ discountedPrice }}%</span></p>
          <Rating class="md:hidden"/>
      <p class="text-gray-700 text-lg">{{ product.description }}</p>
    </div>
    <div class="cartAdd whitespace-nowrap flex flex-col py-6 w-fit px-6">
      <Rating class="hidden md:flex"/>
      <div class="action md:flex justify-between items-center px-6 hidden">
      <button @click="addToCart(product)" class="bg-blue-400 text-white w-[80%] py-2 pr-16 pl-4 rounded flex items-center justify-between cursor-pointer hover:w-[85%]"><Shopping-Cart :size="16" />Add To Cart</button>
      <Heart @click="wishList(product)" class="text-orange-400"/>
    </div></div>
  </div>

    <div v-else>
      <p>Product not found</p>
    </div>
  </section>

  <section class="suggestions place-self-center w-full max-w-[80%]">
    <h2>Suggested For You</h2>

    <BestSeller />
  </section>
</div>

  <footer class="md:hidden py-2 px-6 bg-white shadow-lg border-t-2 flex items-center gap-4 justify-between">
      <Home class="text-blue-400" />
      <button @click="addToCart(product)" class="bg-blue-400 text-white w-[80%] py-2 pr-16 pl-4 rounded flex items-center justify-between cursor-pointer hover:w-[85%]"><Shopping-Cart :size="16" />Add To Cart</button>
  </footer>
</template>
