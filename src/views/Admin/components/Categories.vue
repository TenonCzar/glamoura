<template>
  <section class="px-6 py-6 flex spinnaker flex-col items-center gap-6">
    <h2 class="text-xl font-bold mb-6 bg-orange-400 p-4 text-white">Shop by Category</h2>
    <div class="flex flex-wrap whitespace-nowrap gap-4 justify-center">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-gray-100 text-gray-700 place-self-center p-4 text-center rounded-lg hover:shadow cursor-pointer"
      >
        <p class="font-semibold">{{ cat.name }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])

// Expiry time for cache (1 hour)
const CACHE_KEY = 'cached_categories'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

onMounted(async () => {
  const cached = localStorage.getItem(CACHE_KEY)

  if (cached) {
    const parsed = JSON.parse(cached)
    const now = new Date().getTime()

    if (now - parsed.timestamp < CACHE_DURATION_MS) {
      categories.value = parsed.data
      return // skip fetching, use cached
    }
  }

  // Fetch fresh data
  const res = await fetch('/api/admin/getcategory')
  const data = await res.json()
  categories.value = data

  // Cache it
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: new Date().getTime(),
      data
    })
  )
})
</script>