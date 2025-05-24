  <template>
    <div class="relative h-fit">
      <!-- Cart Button -->
      <button class="relative h-fit flex text-orange-400 hover:text-blue-400" @click="toggleModal">
        <Shopping-cart :size="20" />
        <span
          v-if="cartCount > 0"
          class="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
        >
          {{ cartCount }}
        </span>
      </button>
  
      <!-- Modal Overlay -->
      <div
        v-if="isModalOpen"
        class="fixed right-0 h-fit w-fit p-6 bg-opacity-50 flex justify-center items-center z-50"
        @click.self="toggleModal"
      >
        <!-- Modal -->
        <div class="bg-white p-6 rounded max-w-md w-full shadow-sm shadow-blue-400 max-h-[80vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Your Cart</h3>
          <div v-if="isLoading" class="text-center py-4">Syncing cart...</div>
  
          <div v-if="cart.length === 0 && !isLoading" class="text-center text-gray-500">Your cart is empty.</div>
  
          <div v-else>
            <div
              v-for="(item, index) in cart"
              :key="item.product_id + '-' + (item.variant_id || 'no-variant')"
              class="flex items-center justify-between border-b py-2"
            >
              <div class="flex w-full gap-4">
                <img :src="item.product_image" alt="" class="w-16 h-16 object-cover rounded" />
                <div class="flex flex-col">
                  <p class="font-semibold text-sm">{{ item.product_name }}</p>
                  <p class="font-semibold text-lg">₦{{ item.price.toFixed(2) }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <button 
                      @click="decreaseQuantity(index)" 
                      class="px-2 py-1 bg-gray-200 rounded"
                      :disabled="isLoading"
                    >
                      -
                    </button>
                    <span>{{ item.quantity }}</span>
                    <button 
                      @click="increaseQuantity(index)" 
                      class="px-2 py-1 bg-gray-200 rounded"
                      :disabled="isLoading"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                @click="removeItem(index)"
                class="text-red-500 hover:text-red-700 font-bold"
                title="Remove item"
                :disabled="isLoading"
              >
                ×
              </button>
            </div>
  
            <div class="mt-6 text-right">
              <p class="font-bold text-lg">Total: ₦{{ totalPrice.toFixed(2) }}</p>
              <router-link
                to="/checkout"
                class="inline-block mt-3 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
                @click="toggleModal"
              >
                Checkout
              </router-link>
            </div>
          </div>
  
          <button
            class="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            @click="toggleModal"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import { useAuth } from '@/stores/auth' // Import your auth store

const auth = useAuth()
const isModalOpen = ref(false)
const cart = ref([])
const router = useRouter()
const isLoading = ref(false)

// Refresh cart from localStorage
const refreshCart = () => {
  cart.value = JSON.parse(localStorage.getItem('cart')) || []
}

// Sync cart item with backend
const syncCartItem = async (action, productId, variantId = null, quantity = 1) => {
  if (!auth.isAuthenticated) return
  
  try {
    isLoading.value = true
    const response = await fetch('/api/update-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        action, // 'add', 'remove', or 'update'
        product_id: productId,
        variant_id: variantId,
        quantity
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to sync with server')
    }
  } catch (error) {
    console.error('Sync error:', error)
    // Optional: revert local changes if sync fails
  } finally {
    isLoading.value = false
  }
}

// Enhanced cart operations
const increaseQuantity = async (index) => {
  const item = cart.value[index]
  const newCart = [...cart.value]
  newCart[index].quantity++
  cart.value = newCart
  
  if (auth.isAuthenticated) {
    await syncCartItem('update', item.product_id, item.variant_id, item.quantity++)
  }
}

const decreaseQuantity = async (index) => {
  const item = cart.value[index]
  const newCart = [...cart.value]
  
  if (item.quantity > 1) {
    newCart[index].quantity--
    cart.value = newCart
    
    if (auth.isAuthenticated) {
      await syncCartItem('update', item.product_id, item.variant_id, item.quantity--)
    }
  } else {
    await removeItem(index)
  }
}

const removeItem = async (index) => {
  const item = cart.value[index]
  const newCart = [...cart.value]
  newCart.splice(index, 1)
  cart.value = newCart
  
  if (auth.isAuthenticated) {
    await syncCartItem('remove', item.product_id, item.variant_id)
  }
}

// Initialize and watch for changes
onMounted(() => {
  refreshCart()
  window.addEventListener('storage', (event) => {
    if (event.key === 'cart') refreshCart()
  })
})

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
  refreshCart()
}

// Persist changes to localStorage
watch(
  cart,
  debounce((newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('storage'))
  }, 300),
  { deep: true }
)

// Computed properties
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
</script>
