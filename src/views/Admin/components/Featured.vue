<template>
  <section class="px-6 py-12 flex flex-col gap-6">
    <ResponseDisplayer ref="responseDisplayer" />
    <h2 class="text-2xl font-bold mb-6">Featured Products</h2>
    <div class="grid grid-cols-auto-fit gap-6 justify-center place-items-center">
      <span
        v-if="isLoading"
        class="loading loading-bars loading-xl mx-auto place-self-center"
      ></span>
      <div
  v-for="product in featured"
  :key="product.id"
  class="w-[200px] h-fit gap-4 bg-white rounded shadow-sm hover:shadow-lg flex flex-col justify-between relative overflow-hidden"
>
  <router-link
    :to="`/products/${slugify(product.slug)}`"
    class="w-full h-full flex-col flex gap-4 justify-between"
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
        Math.abs(
          Math.round(((product.discount - product.price) / product.discount) * 100),)
      }}%
    </div>

    <!-- Product Info Section (Fixed Height) -->
    <div class="p-2 flex-1 flex flex-col gap-4 justify-between">
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
          <button @click.prevent="addToCart(product)" class="text-orange-400 hover:text-orange-600">
            <Shopping-Cart :size="18" />
          </button>
          <button @click.prevent="wishList(product)" class="text-orange-400 hover:text-orange-600">
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

const featured = ref([])
const isLoading = ref(true)
const responseDisplayer = ref(null)

const CACHE_KEY = 'cached_featured_products'

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

const addToCart = async (product) => {
  try {
    const isLoggedIn = false
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    const existingIndex = cart.findIndex(
      (item) =>
        item.product_id === product.id &&
        (item.variant_id || null) === (product.variant_id || null),
    )

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
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
  const cached = localStorage.getItem(CACHE_KEY)

  // 1. Show cached immediately (even if expired)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      featured.value = parsed.data
    } catch (err) {
      console.warn('Failed to parse cached data:', err)
    }
  }

  // 2. Fetch in the background (show spinner only if nothing is cached)
  if (!cached) isLoading.value = true

  try {
    const res = await fetch('/api/admin/featured-products')
    const data = await res.json()

    if (data.success) {
      const products = data.products.map((p) => ({
        id: p.product_id,
        name: p.name,
        slug: p.slug,
        image:
          p.image_url ||
          'https://th.bing.com/th/id/OPHS.GztVYTK7po92Yg474C474?w=592&h=550&o=5&pid=21.1',
        category: p.category || '',
        price: Number(p.price),
        discount: p.compare_at_price ? Number(p.compare_at_price) : null,
      }))

      const previous = cached ? JSON.parse(cached).data : null

      const isSame =
        previous &&
        JSON.stringify(previous) === JSON.stringify(products)

      if (!isSame) {
        // update both localStorage and UI silently
        featured.value = products
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: products })
        )
      }
    }
  } catch (err) {
    console.error('Error fetching products:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.grid-cols-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
}

.discount {
  font-size: 3px;
}
</style>
