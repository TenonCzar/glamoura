<template>
    <button
      @click="$emit('click')"
      class="flex flex-col items-center justify-center rounded-lg border border-gray-200 gap-3 p-4 text-center transition-all text-indigo-400 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <div class="mb-2 rounded-full bg-indigo-100 p-3 text-indigo-600">
        <component :is="icon" class="h-6 w-6" />
      </div>
      <span class="text-sm font-medium">{{ label }}</span>
    </button>
  </template>
  
  <script setup>
  defineProps({
    icon: {
      type: Object,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  })
  
  defineEmits(['click'])
  </script>