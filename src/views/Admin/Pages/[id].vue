<template>
    <div class="p-6 max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Edit Product</h2>
  
      <form @submit.prevent="submitForm" v-if="formLoaded">
        <!-- Product Name -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Name</label>
          <input v-model="product.name" class="input input-bordered w-full" />
        </div>
  
        <!-- Slug -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Slug</label>
          <input v-model="product.slug" class="input input-bordered w-full" />
        </div>
  
        <!-- Price -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Price</label>
          <input v-model.number="product.price" type="number" class="input input-bordered w-full" />
        </div>
  
        <!-- Categories (Multiselect) -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Categories</label>
          <Multiselect
            v-model="product.categories"
            :options="allCategories"
            label="name"
            track-by="category_id"
            multiple
          />
        </div>
  
        <!-- Images -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Images</label>
          <div class="flex gap-3 flex-wrap mb-2">
            <div
              v-for="img in product.images"
              :key="img.image_id"
              class="w-24 h-24 bg-gray-100 border rounded relative overflow-hidden"
            >
              <img :src="img.image_url" class="w-full h-full object-cover" />
            </div>
          </div>
          <input type="file" multiple @change="handleImageUpload" />
        </div>
  
        <!-- Variants -->
        <div class="mb-6">
          <h3 class="font-semibold mb-2">Variants</h3>
          <div
            v-for="(variant, index) in product.variants"
            :key="index"
            class="mb-2 border p-3 rounded bg-gray-50"
          >
            <label>SKU:</label>
            <input v-model="variant.sku" class="input input-bordered w-full mb-2" />
            <label>Price:</label>
            <input v-model.number="variant.price" class="input input-bordered w-full" />
          </div>
        </div>
  
        <!-- Inventory -->
        <div class="mb-4">
          <label class="block font-semibold mb-1">Inventory Quantity</label>
          <input
            v-model.number="product.inventory[0].quantity"
            type="number"
            class="input input-bordered w-full"
          />
        </div>
  
        <!-- Submit -->
        <button class="btn btn-primary">Update Product</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import Multiselect from 'vue-multiselect'
  
  const route = useRoute()
  const product = ref(null)
  const formLoaded = ref(false)
  const allCategories = ref([])
  
  onMounted(async () => {
    const id = route.params.id
  
    // Get product info
    const res = await axios.get(`/api/admin/product/${id}`)
    product.value = res.data.product
    formLoaded.value = true
  
    // Get categories for dropdown
    const catRes = await axios.get('/api/admin/getcategory')
    allCategories.value = catRes.data.categories
  })
  
  function handleImageUpload(event) {
    const files = event.target.files
    // You can either upload immediately or store them for later upload
    console.log('New images:', files)
  }
  
  function submitForm() {
    // This is where you'd make a PUT request with updated form data
    console.log('Submitting product:', product.value)
  }
  </script>
  
  <style scoped>
  .input {
    border: 1px solid antiquewhite;
    width: 100%;
    padding:5px;
    /* @apply border p-2 rounded w-full; */
  }
  </style>