<template>
  <section class="bg-indigo-600 px-6 py-6 flex flex-col gap-6">
    <h2 class="text-2xl font-bold lato mb-6 text-gray-200">New Arrivals</h2>
    <span v-if="isLoading" class="loading loading-bars loading-xl mx-auto place-self-center"></span>
    <div class="flex gap-6 overflow-x-auto pb-4">
      <div
        v-for="item in newArrivals"
        :key="item.id"
        class="w-[200px] bg-white rounded shadow-sm hover:shadow-lg flex flex-col gap-4 justify-between pb-6"
      >
        <img :src="item.image" class="mb-2 w-full h-[200px] rounded" />
        <div class="flex flex-col gap-2 px-4">
          <h3 class="font-medium">{{ item.name }}</h3>
          <div class="flex gap-4">
            <p class="text-indigo-600 font-bold">₦{{ item.price }}</p>
            <div
              class="bg-orange-400 text-[2px] w-fit text-white flex items-center play p-1 rounded-full"
            >
              {{
                Math.abs(Math.round(((item.discount - item.price) / item.discount) * 100))
              }}%
            </div>
          </div>
          <button
            class="bg-blue-900 text-white p-2 rounded cursor-pointer hover:bg-orange-400 flex items-center justify-center gap-4"
          >
            Add to cart<Shopping-cart :size="16" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const newArrivals = ref([])

onMounted(async () => {
  const res = await fetch('/api/admin/getproducts') // Adjust to your actual path
  const data = await res.json()
  if (data.success) {
    newArrivals.value = data.products.map((p) => ({
      id: p.product_id,
      name: p.name,
      image:
        p.image_url ||
        'https://th.bing.com/th/id/OPHS.GztVYTK7po92Yg474C474?w=592&h=550&o=5&pid=21.1',
      category: p.category || '',
      price: p.price,
      discount: p.compare_at_price,
    }))
    console.log(data)
    // isLoading.value = false
  }
})
</script>
