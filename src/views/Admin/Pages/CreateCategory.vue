<template>
  <ResponseDisplayer ref="responseDisplayer" />
  <form
    @submit.prevent="submitCategory"
    class="flex flex-col gap-4 max-w-xl mx-auto text-gray-200 p-6 rounded shadow space-y-4"
  >
    <h2 class="text-2xl font-bold mb-4">Add Category</h2>

    <input v-model="form.name" placeholder="Category Name" class="input" required />
    <textarea v-model="form.description" placeholder="Description" class="input"></textarea>
    <input v-model="form.slug" placeholder="Slug (optional)" class="input" />
    <input type="file" @change="handleImageUpload" accept="image/*" class="input" />

    <label class="flex items-center w-fit whitespace-nowrap gap-2 text-sm">
      <input type="checkbox" v-model="form.is_parent" />Is Parent Category
    </label>

    <!-- Only show parent category dropdown if not a parent -->
    <div v-if="!form.is_parent">
      <label>Select Parent Category</label>
      <multiselect
        v-model="form.parent_id"
        :options="parentCategoryOptions"
        :searchable="true"
        :multiple="true"
        placeholder="-- Select Parent Category --"
        label="name"
        track-by="category_id"
        :show-labels="false"
      ></multiselect>
    </div>

    <label class="flex relative items-center gap-2 w-fit text-sm">
      <input type="checkbox" v-model="form.is_active" />
      Active
    </label>

    <input
      type="number"
      v-model.number="form.display_order"
      placeholder="Display Order"
      class="input"
    />

    <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded">Create Category</button>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Multiselect from 'vue-multiselect'

const responseDisplayer = ref(null)

const form = ref({
  name: '',
  description: '',
  slug: '',
  image: null,
  is_parent: true,
  parent_id: null,
  is_active: true,
  display_order: 0,
})

const parentCategories = ref([])

// Format options for multiselect
const parentCategoryOptions = computed(() => {
  return parentCategories.value.map((cat) => ({
    name: cat.name,
    category_id: cat.category_id,
  }))
})

onMounted(async () => {
  try {
    const res = await fetch('/api/admin/parentcategories')
    parentCategories.value = await res.json()
  } catch (error) {
    console.error('Error loading categories:', error)
  }
})

const handleImageUpload = (e) => {
  form.value.image = e.target.files[0]
}

const submitCategory = async () => {
  const data = new FormData()
  for (const key in form.value) {
    if (key === 'image' && form.value.image) {
      data.append('image', form.value.image)
    } else {
      data.append(key, form.value[key])
    }
  }

  const res = await fetch('/api/admin/createcategory', {
    method: 'POST',
    body: data,
  })

  const result = await res.json()
  result.success
    ? responseDisplayer.value.showSuccess('Category Created')
    : responseDisplayer.value.showError('Error Creating Category')
}
</script>

<style scoped>
.input,
input {
  border: 1px solid gray;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  outline: none;
  background: transparent;
  /* @apply w-full border border-gray-300 p-2 rounded; */
}
.multiselect {
  margin-top: 0.5rem;
  height: 100%;
}
.multiselect__tags {
  border: 1px solid #ddd;
  min-height: 200px;
}
.multiselect__placeholder {
  color: #999;
}
</style>
