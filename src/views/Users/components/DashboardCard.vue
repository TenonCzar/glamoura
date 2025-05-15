<template>
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="p-6">
        <div class="flex items-center gap-6">
          <div class="p-3 rounded-full" :class="color">
            <component :is="icon" class="h-6 w-6" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">{{ title }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    value: [String, Number],
    icon: Object,
    color: {
      type: String,
      default: 'bg-blue-100 text-blue-600'
    }
  })
  </script>