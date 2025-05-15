<template>
    <section class="px-6 py-6 flex spinnaker flex-col items-center gap-6">
    <h2 class="text-xl font-bold mb-6 bg-orange-400 p-4 text-white">Shop by Category</h2>
    <div class="flex flex-wrap whitespace-nowrap gap-4 justify-center">
      <div v-for="cat in categories" :key="cat.id" class="bg-gray-100 text-gray-700 place-self-center p-4 text-center rounded-lg hover:shadow cursor-pointer">
        <p class="font-semibold">{{ cat.name }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import {ref, onMounted} from 'vue'
const categories = ref([])

onMounted(async () => {
  const res = await fetch('/api/admin/getcategory')
  categories.value = await res.json()
})
</script>