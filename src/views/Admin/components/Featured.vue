<template>
  <section class="px-6 py-12 flex flex-col gap-6">
    <h2 class="text-2xl font-bold mb-6">Featured Products</h2>
    <div class="grid grid-cols-auto-fit gap-6 justify-center place-items-center md:gap-20">
      <span
        v-if="isLoading"
        class="loading loading-bars loading-xl mx-auto place-self-center"
      ></span>
      <div
        v-for="product in featured"
        :key="product.id"
        class="w-fit bg-white rounded shadow-sm hover:shadow-lg flex flex-col lg:flex-row gap-2 justify-between"
      >
        <img :src="product.image" class="mb-3 rounded w-full md:h-[200px]" />
        <div class="detail flex flex-col p-4 items-center justify-center">
          <div class="detail flex flex-col gap-2">
            <h3 class="font-semibold">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm">{{ product.category }}</p>
            <div class="flex gap-4 justify-between">
              <p class="text-indigo-600 font-bold">₦{{ product.price }}</p>
              <div class=" bg-orange-400 text-[5px] w-[25px] h-[25px] text-white flex items-center play p-1 rounded-full justify-center">{{ Math.abs(Math.round(((product.discount - product.price) / product.discount) * 100)) }}%</div>
            </div>
            <button @click="addToCart"
              class="bg-blue-900 text-white whitespace-nowrap p-2 rounded w-fit text-lg place-self-center cursor-pointer hover:bg-orange-400 hover:text-white flex items-center justify-center gap-4"
            >
              Add to cart<Shopping-cart :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const featured = ref([])
const router = useRouter()
const isLoading = ref(true)


const addToCart = async (product) => {
  isLoading.value = true

  try {
    const res = await fetch('/api/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.product_id,
        variant_id: product.variant_id || null,
        quantity: 1,
        price: product.price,
      }),
    })

    const data = await res.json()
    isLoading.value = false

    if (data.success) {
      alert(data.message)
    } else {
      alert(data.error || 'Failed to add to cart.')
    }
  } catch (err) {
    isLoading.value = false
    alert('An error occurred while adding to cart.' + err)
  }
}


onMounted(async () => {
  const res = await fetch('/api/featured-products') // Adjust to your actual path
  const data = await res.json()
  if (data.success) {
    featured.value = data.products.map((p) => ({
      id: p.product_id,
      name: p.name,
      image: p.image_url || '/src/assets/IMG-1.jpg',
      category: p.category || '',
      price: p.price,
      discount: p.compare_at_price,
    }))
    console.log(data)
    isLoading.value = false
  }
})
</script>


<style scoped>
.grid-cols-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
}

.discount {
  font-size: 3px;
}
</style>