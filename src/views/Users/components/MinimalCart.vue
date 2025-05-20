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

        <div v-if="cart.length === 0" class="text-center text-gray-500">Your cart is empty.</div>

        <div v-else>
          <div
            v-for="(item, index) in cart"
            :key="item.product_id + '-' + (item.variant_id || 'no-variant')"
            class="flex items-center justify-between border-b py-2"
          >
            <div class="flex w-full gap-4">
              <img :src="item.product_image" alt="" class="w-16 h-16 object-cover rounded" />
              <div class="flex flex-col">
                <p class="font-semibold">{{ item.product_name }}</p>
                <p>₦{{ item.price.toFixed(2) }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <button @click="decreaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button @click="increaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              @click="removeItem(index)"
              class="text-red-500 hover:text-red-700 font-bold"
              title="Remove item"
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const isModalOpen = ref(false)
const cart = ref(JSON.parse(localStorage.getItem('cart')) || [])

const router = useRouter()

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
  cart
}

// Calculate total quantity for badge
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))

// Calculate total price
const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

// Update localStorage whenever cart changes
watch(
  cart,
  (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
  },
  { deep: true },
)

const increaseQuantity = (index) => {
  cart.value[index].quantity++
}

const decreaseQuantity = (index) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity--
  } else {
    removeItem(index)
  }
}

const removeItem = (index) => {
  cart.value.splice(index, 1)
}
</script>

<style scoped>
/* Simple scrollbar for modal */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
</style>
