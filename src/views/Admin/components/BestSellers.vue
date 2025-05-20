<template>
  <section class="px-6 py-12">
    <ResponseDisplayer ref="responseDisplayer" />
    <h2 class="text-2xl font-bold mb-6">Best Sellers</h2>
    <div class="flex gap-6 overflow-x-auto pb-4">
      <div
        v-for="product in bestSellers"
        :key="product.id"
        class="min-w-[200px] max-w-[200px] h-fit bg-white rounded shadow-sm hover:shadow-lg flex flex-col justify-between relative overflow-hidden"
      >
        <router-link
          :to="`/products/${slugify(product.slug)}`"
          class="w-full h-full flex flex-col gap-2 justify-between"
        >
          <!-- Image Section (Fixed Height) -->
          <div class="h-[160px] overflow-hidden flex items-center justify-center">
            <img
              :src="product.image"
              class="w-full h-full object-cover rounded-t"
              :alt="product.name"
            />
          </div>

          <!-- Discount Badge (Absolute Positioned) -->
          <div
            v-if="product.discount"
            class="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center"
          >
            {{
              Math.abs(Math.round(((product.discount - product.price) / product.discount) * 100))
            }}%
          </div>

          <!-- Product Info Section (Fixed Height) -->
          <div class="p-2 flex-1 flex flex-col gap-2 justify-between">
            <!-- Product Name (With Ellipsis for Overflow) -->
            <h3 class="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              {{ product.name }}
            </h3>

            <!-- Category -->
            <p class="text-gray-600 text-xs">{{ product.category }}</p>

            <!-- Price and Actions -->
            <div class="flex justify-between items-center mt-2">
              <p class="text-indigo-600 font-bold text-sm">₦{{ product.price }}</p>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  @click.prevent="addToCart(product)"
                  class="text-orange-400 hover:text-orange-600"
                >
                  <Shopping-Cart :size="18" />
                </button>
                <button
                  @click.prevent="wishList(product)"
                  class="text-orange-400 hover:text-orange-600"
                >
                  <Heart :size="18" />
                </button>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const bestSellers = ref([])
const responseDisplayer = ref(null)

const CACHE_KEY = 'cached_bestsellers_products'

// Slugify utility
const slugify = (text) =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

// Show cached products immediately
const loadCached = () => {
  const cached = localStorage.getItem(CACHE_KEY)
  if (!cached) return null

  try {
    const parsed = JSON.parse(cached)
    bestSellers.value = parsed.data
    return parsed.data
  } catch (err) {
    console.warn('Failed to parse cached best sellers:', err)
    return null
  }
}

// Fetch from backend and update cache & UI silently
const fetchAndUpdate = async (previous = null) => {
  try {
    const res = await fetch('/api/admin/bestsellers')
    const data = await res.json()

    if (data.success) {
      const products = data.products.map((p) => ({
        id: p.product_id,
        name: p.name,
        slug: p.slug,
        image: p.image_url || '/src/assets/IMG-1.jpg',
        category: p.category || '',
        price: Number(p.price),
        discount: p.compare_at_price ? Number(p.compare_at_price) : null,
      }))

      const isSame = previous && JSON.stringify(previous) === JSON.stringify(products)

      if (!isSame) {
        bestSellers.value = products
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: products })
        )
      }
    }
  } catch (err) {
    console.error('Error fetching best sellers:', err)
  }
}

onMounted(() => {
  const cached = loadCached() // 1. Load cached
  fetchAndUpdate(cached)      // 2. Fetch & update silently
})
</script>
