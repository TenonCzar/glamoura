<template>
  <section class="bg-indigo-600 px-6 py-6 flex flex-col gap-6">
    <ResponseDisplayer ref="responseDisplayer" />
    <h2 class="text-2xl font-bold lato mb-6 text-gray-200">New Arrivals</h2>
    <span v-if="isLoading" class="loading loading-bars loading-xl mx-auto place-self-center"></span>
    <div class="grid grid-cols-auto-fit gap-6 justify-center place-items-center">
      <div
  v-for="product in newArrivals"
  :key="product.id"
  class="w-[200px] h-fit gap-4 bg-white rounded shadow-sm hover:shadow-lg flex flex-col justify-between relative overflow-hidden"
>
  <router-link
    :to="`/products/${slugify(product.slug)}`"
    class="w-full h-full flex flex-col gap-4 justify-between"
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
      
      <!-- Price and Actions -->
      <div class="flex justify-between items-center mt-2">
        <p class="text-indigo-600 font-bold text-sm">₦{{ product.price }}</p>
        
        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button @click.prevent="handleAddToCart(product)" class="text-orange-400 hover:text-orange-600">
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
import { addToCart } from '@/utils/cart'
import { useAuth } from '@/stores/auth'

const newArrivals = ref([])
const isLoading = ref(true)
const responseDisplayer = ref(null)

const CACHE_KEY = 'cached_new_arrivals'

const slugify = (text) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

const handleAddToCart = async (product) => {
  try {
    // 1. Input sanitization
    const sanitizedProduct = {
      id: Number(product.id),
      name: String(product.name),
      image: String(product.image),
      variant_id: product.variant_id ? Number(product.variant_id) : null,
      price: Math.max(0, Number(product.price)), // Prevent negative prices
      max_per_order: product.max_per_order ? Number(product.max_per_order) : 10 // Default limit
    };

    // 2. Check local cart first for quantity limits
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = localCart.find(
      item => item.product_id === sanitizedProduct.id && 
      (item.variant_id || null) === (sanitizedProduct.variant_id || null)
    );

    // 3. Validate against limits
    const proposedQty = existingItem ? existingItem.quantity + 1 : 1;
    if (proposedQty > sanitizedProduct.max_per_order) {
      throw new Error(`Maximum ${sanitizedProduct.max_per_order} per order`);
    }

    // 4. Update localStorage immediately (optimistic update)
    const updatedCart = existingItem
      ? localCart.map(item => 
          item.product_id === sanitizedProduct.id && 
          (item.variant_id || null) === (sanitizedProduct.variant_id || null)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...localCart,
          {
            product_id: sanitizedProduct.id,
            product_name: sanitizedProduct.name,
            product_image: sanitizedProduct.image,
            variant_id: sanitizedProduct.variant_id,
            quantity: 1,
            price: sanitizedProduct.price,
          }
        ];

    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // 5. Sync with backend if logged in
    const auth = useAuth();
    if (auth.isAuthenticated()) {
      const result = await addToCart(sanitizedProduct);
      responseDisplayer.value.showSuccess(result.message);
    } else {
      responseDisplayer.value.showSuccess(
        `${sanitizedProduct.name} added to cart. Login to save your progress.`
      );
    }

  } catch (err) {
    // Revert localStorage on error
    localStorage.setItem('cart', JSON.stringify(
      JSON.parse(localStorage.getItem('cart')) // Revert to previous
    ));
    
    responseDisplayer.value.showError(
      err.message.includes('Maximum') 
        ? err.message 
        : `Couldn't add to cart: ${err.message}`
    );
  }
};

onMounted(async () => {
  const cached = localStorage.getItem(CACHE_KEY)

  // 1. Show cached immediately (even if expired)
  if (cached) {
    isLoading.value = false;
    try {
      const parsed = JSON.parse(cached)
      newArrivals.value = parsed.data
    } catch (err) {
      console.warn('Failed to parse cached data:', err)
    }
  }

  // 2. Fetch in the background (show spinner only if nothing is cached)
  if (!cached) isLoading.value = true

  try {
    const res = await fetch('/api/admin/getproducts')
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
        newArrivals.value = products
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
}</style>