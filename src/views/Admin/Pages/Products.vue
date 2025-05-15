<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">All Products</h1>
    <table class="w-full table-auto border">
      <thead class="bg-gray-200 text-left">
        <tr>
          <th class="p-2">Image</th>
          <th class="p-2">Name</th>
          <th class="p-2">Price</th>
          <th class="p-2">Status</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.product_id" class="border-b">
          <td class="p-2">
            <img :src="product.image_url" alt="thumb" class="h-12 w-12 object-cover rounded" />
          </td>
          <td class="p-2">{{ product.name }}</td>
          <td class="p-2">₦{{ product.price }}</td>
          <td class="p-2">
            <span v-if="product.is_active" class="text-green-600 font-semibold">Active</span>
            <span v-else class="text-gray-400">Inactive</span>
          </td>
          <td class="p-2 space-x-2">
            <router-link :to="`/admin/editproduct/${product.product_id}`" class="text-blue-600">Edit</router-link>
            <button @click="deleteProduct(product.product_id)" class="text-red-500">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])

onMounted(async () => {
  const res = await fetch('/api/admin/getproducts')
  const data = await res.json()
  products.value = data.products
})

const deleteProduct = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    await fetch(`/api/admin/deleteproduct/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.product_id !== id)
  }
}
</script>