<template>
  <form
    @submit.prevent="submitProduct"
    class="space-y-6 flex flex-col gap-4 max-w-3xl mx-auto p-6 shadow rounded text-gray-200"
  >
    <h2 class="text-2xl font-bold bg-primaryblue">Add Product</h2>

    <input v-model="form.name" type="text" placeholder="Product Name" required class="input" />
    <textarea v-model="form.description" placeholder="Full Description" class="input"></textarea>
    <input
      v-model="form.short_description"
      type="text"
      placeholder="Short Description"
      class="input"
    />
    <input v-model="form.sku" type="text" placeholder="SKU" required class="input" />
    <input v-model.number="form.price" type="number" placeholder="Price" required class="input" />
    <input
      v-model.number="form.compare_at_price"
      type="number"
      placeholder="Compare at Price"
      class="input"
    />
    <input v-model.number="form.cost_price" type="number" placeholder="Cost Price" class="input" />

    <div class="flex gap-2">
      <label class="flex items-center">
        <input 
          type="checkbox" 
          :checked="form.is_taxable === 1" 
          @change="form.is_taxable = $event.target.checked ? 1 : 0" 
        /> 
        Taxable
      </label>
      <label class="flex items-center">
        <input 
          type="checkbox" 
          :checked="form.is_active === 1" 
          @change="form.is_active = $event.target.checked ? 1 : 0" 
        /> 
        Active
      </label>
      <label class="flex items-center">
        <input 
          type="checkbox" 
          :checked="form.is_featured === 1" 
          @change="form.is_featured = $event.target.checked ? 1 : 0" 
        /> 
        Featured
      </label>
      <label class="flex items-center">
        <input 
          type="checkbox" 
          :checked="form.is_bestseller === 1" 
          @change="form.is_bestseller = $event.target.checked ? 1 : 0" 
        /> 
        Bestseller
      </label>
      <label class="flex items-center">
        <input 
          type="checkbox" 
          :checked="form.is_new === 1" 
          @change="form.is_new = $event.target.checked ? 1 : 0" 
        /> 
        New
      </label>
    </div>

    <input v-model.number="form.weight" type="number" placeholder="Weight" class="input" />
    <select v-model="form.weight_unit" class="input">
      <option value="g">g</option>
      <option value="kg">kg</option>
      <option value="lb">lb</option>
      <option value="oz">oz</option>
    </select>

    <input v-model="form.slug" type="text" placeholder="Slug" required class="input" />
    <input v-model="form.meta_title" type="text" placeholder="Meta Title" class="input" />
    <textarea
      v-model="form.meta_description"
      placeholder="Meta Description"
      class="input"
    ></textarea>

    <!-- Image Upload -->
    <label>Product Images</label>
    <input type="file" multiple accept="image/*" @change="handleImageUpload" class="input" />

    <!-- Category Multi-Select -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Categories</label>
      <Multiselect
        v-model="form.categories"
        :options="categories"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Select categories"
        label="name"
        track-by="category_id"
        class="mt-1 input"
      />
    </div>

    <!-- Product Condition Dropdown -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Condition</label>
      <select v-model="form.condition" class="input">
        <option value="new">New</option>
        <option value="used">Used</option>
        <option value="refurbished">Refurbished</option>
      </select>
    </div>
    
    <!-- Variants -->
    <div class="mt-6 space-y-4">
      <h3 class="font-bold">Variants</h3>
      <div v-for="(variant, index) in form.variants" :key="index" class="grid grid-cols-2 gap-2">
        <input v-model="variant.sku" placeholder="SKU" class="input" />
        <input v-model.number="variant.price" placeholder="Price" class="input" />
        <input v-model.number="variant.cost_price" placeholder="Cost Price" class="input" />
        <input
          v-model.number="variant.compare_at_price"
          placeholder="Compare at Price"
          class="input"
        />
        <input v-model.number="variant.weight" placeholder="Weight" class="input" />
        <select v-model="variant.weight_unit" class="input">
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
          <option value="oz">oz</option>
        </select>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            :checked="variant.is_default === 1" 
            @change="variant.is_default = $event.target.checked ? 1 : 0" 
          /> 
          Default Variant
        </label>
        <button @click.prevent="removeVariant(index)" class="text-red-500">Remove</button>

        <input
          v-model.number="variant.inventory_quantity"
          type="number"
          placeholder="Inventory Quantity"
          class="input"
        />
        <input
          v-model.number="variant.low_stock_threshold"
          type="number"
          placeholder="Low Stock Threshold"
          class="input"
        />
        <input
          v-model="variant.location"
          type="text"
          placeholder="Stock Location (optional)"
          class="input"
        />
      </div>
      <button @click.prevent="addVariant" class="bg-blue-500 text-white px-3 py-1 rounded">
        + Add Variant
      </button>
    </div>

    <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded">Create Product</button>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Multiselect from 'vue-multiselect'

const categories = ref([])
const form = ref({
  name: '',
  description: '',
  short_description: '',
  sku: '',
  price: 0,
  compare_at_price: null,
  cost_price: null,
  is_taxable: 1, // Changed from boolean to number
  weight: null,
  weight_unit: 'g',
  is_active: 1, // Changed from boolean to number
  is_featured: 0, // Changed from boolean to number
  is_bestseller: 0, // Changed from boolean to number
  is_new: 0, // Changed from boolean to number
  slug: '',
  meta_title: '',
  meta_description: '',
  images: [],
  variants: [],
  condition: 'new'
})

const handleImageUpload = (e) => {
  form.value.images = Array.from(e.target.files)
}

watch(
  () => form.value.condition,
  (newVal) => {
    form.value.is_new = newVal === 'new' ? 1 : 0
  }
)

const addVariant = () => {
  form.value.variants.push({
    sku: '',
    price: null,
    cost_price: null,
    compare_at_price: null,
    weight: null,
    weight_unit: 'g',
    is_default: 0, // Changed from boolean to number
    inventory_quantity: 0,
    low_stock_threshold: 5,
    location: '',
  })
}

const removeVariant = (index) => {
  form.value.variants.splice(index, 1)
}

const submitProduct = async () => {
  const data = new FormData()

  // Append all fields
  for (const key in form.value) {
    if (key === 'images') {
      form.value.images.forEach((file) => data.append('images', file))
    } else if (key === 'variants') {
      data.append('variants', JSON.stringify(form.value.variants))
    } else if (key === 'categories') {
      data.append('categories', JSON.stringify(form.value.categories.map((cat) => cat.category_id)))
    } else {
      data.append(key, form.value[key])
    }
  }

  const res = await fetch('/api/admin/createproduct', {
    method: 'POST',
    body: data,
  })

  const result = await res.json()
  if (result.success) {
    alert('Product created successfully!')
  } else {
    alert('Failed: ' + result.error)
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/admin/getcategory')
    categories.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
})
</script>

<style scoped>
input,
textarea {
  border: 1px solid gray;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  outline: none;
}
</style>