<template>
  <div class="px-6 py-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900">Order #{{ order.id }}</h3>
        <p class="text-sm text-gray-500">{{ formatDate(order.date) }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium">{{ order.status }}</p>
        <p class="text-sm text-gray-500">{{ order.items }} item(s)</p>
      </div>
    </div>
    <div class="mt-2 flex justify-between items-center">
      <span class="text-sm font-medium">₦{{ order.total.toFixed(2) }}</span>
      <button 
        v-if="order.trackingNumber" 
        class="text-sm text-blue-600 hover:text-blue-500"
        @click="trackOrder(order.trackingNumber)"
      >
        Track
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  order: Object
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const trackOrder = (trackingNumber) => {
  console.log('Tracking:', trackingNumber)
  // Implement tracking logic
}
</script>