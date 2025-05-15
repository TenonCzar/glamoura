<template>
    <div class="group relative">
      <div class="aspect-square w-full overflow-hidden rounded-md bg-gray-200">
        <img 
          :src="product.image" 
          :alt="product.name"
          class="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
        />
      </div>
      <div class="mt-4">
        <h3 class="text-sm font-medium text-gray-900 line-clamp-1">
          {{ product.name }}
        </h3>
        <div class="mt-1 flex items-center">
          <div class="flex items-center">
            <StarIcon 
              v-for="i in 5" 
              :key="i"
              class="h-4 w-4"
              :class="i <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'"
            />
          </div>
          <span class="ml-1 text-xs text-gray-500">
            ({{ product.rating.toFixed(1) }})
          </span>
        </div>
        <p class="mt-1 text-sm font-medium text-gray-900">
          ₦{{ product.price.toFixed(2) }}
        </p>
      </div>
      <div class="mt-4">
        <button 
          @click="addToCart"
          class="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Star as StarIcon } from 'lucide-vue-next'
  
  const props = defineProps({
    product: {
      type: Object,
      required: true
    }
  })
  
  const addToCart = () => {
    console.log('Added to cart:', props.product.id)
    // Emit event or call store action
    // emit('add-to-cart', props.product)
  }
  </script>