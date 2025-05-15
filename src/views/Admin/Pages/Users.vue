<template>
  <div class="mt-10 p-4 text-gray-200 flex flex-col gap-6 w-full">
    <div class="flex justify-between items-center mb-4 w-[90%]">
      <h2 class="text-2xl font-bold">Users</h2>
      <input
        v-model="search"
        @input="fetchUsers"
        type="text"
        placeholder="Search by name or email"
        class="border px-3 py-2 rounded w-1/3"
      />
    </div>
    <transition name="bounce">
            <div 
                v-if="isLoading" 
                class="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50"
            >
                <div class="bouncing-logo">
                    <img 
                        src="@/assets/logo.webp" 
                        alt="Loading..." 
                        class="h-24 w-auto"
                    />
                </div>
            </div>
        </transition>
    <div class="table-container text-gray-200 overflow-x-scroll w-full">
      <table class="w-full border whitespace-nowrap">
        <thead class="bg-gray-100 text-blue-950 text-xl uppercase whitespace-nowrap">
          <tr>
            <th class="px-4 py-4 border text-left">id</th>
            <th class="px-4 py-4 border text-left">Username</th>
            <th class="px-4 py-4 border text-left">Email</th>
            <th class="px-4 py-4 border">First Name</th>
            <th class="px-4 py-4 border">Last Name</th>
            <th class="px-4 py-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t">
            <td class="px-4 py-4 border">{{ user.user_id }}</td>
            <td class="px-4 py-4 border">{{ user.username }}</td>
            <td class="px-4 py-4 border">{{ user.email }}</td>
            <td class="px-4 py-4 border text-center">{{ user.first_name }}</td>
            <td class="px-4 py-4 border text-center">{{ user.last_name }}</td>
            <td class="px-4 py-4 flex gap-2 justify-center">
              <button
                @click="openEdit(user)"
                class="bg-blue-500 cursor-pointer text-white px-2 py-1 rounded"
              >
                <Icon icon="mdi:edit" />
              </button>
              <button
                @click="deleteUser(user.user_id)"
                class="bg-red-500 cursor-pointer text-white px-2 py-1 rounded"
              >
                <Icon icon="mdi:delete" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
    <div class="flex justify-between mt-4 w-full text-gray-700">
      <button @click="prevPage" :disabled="page === 1" class="px-4 py-2 bg-gray-200 rounded">
        Prev
      </button>
      <button
        @click="nextPage"
        :disabled="page * limit >= total"
        class="px-4 py-2 bg-gray-200 rounded"
      >
        Next
      </button>
    </div>

    <!-- Edit Modal -->
    <div v-if="editing" class="fixed inset-0 bg-blue-500/50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4">
        <h3 class="text-xl font-bold mb-4">Edit User</h3>
        <input v-model="editData.user_id" readonly class="border w-full p-2 rounded mb-2" />
        <input v-model="editData.username" class="border w-full p-2 rounded mb-2" />
        <input v-model="editData.email" class="border w-full p-2 rounded mb-2" />
        <input
          v-model="editData.first_name"
          type="text"
          placeholder="First Name"
          class="border w-full p-2 rounded mb-4"
        />
        <input
          v-model="editData.last_name"
          type="text"
          placeholder="Last Name"
          class="border w-full p-2 rounded mb-4"
        />
        <div class="flex justify-end gap-2">
          <button @click="updateUser" class="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
          <button @click="editing = false" class="bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const users = ref([])
const page = ref(1)
const limit = 10
const total = ref(0)
const search = ref('')
const isLoading = ref(true)
const editing = ref(false)
const editData = ref({ user_id: 0, username: '', email: '', first_name: '', last_name: '' })

const fetchUsers = async () => {
  isLoading.value = true
  try{
  const res = await fetch(
    `/api/admin/getusers?page=${page.value}&limit=${limit}&search=${search.value}`,
  )
  const data = await res.json()
  if (data.success) {
    users.value = data.users
    total.value = data.total
  }
}catch (error) {
        console.error('Error fetching orders:', error)
    } finally {
        isLoading.value = false // Hide loader when done
    }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchUsers()
  }
}

const nextPage = () => {
  if (page.value * limit < total.value) {
    page.value++
    fetchUsers()
  }
}

const deleteUser = async (user_id) => {
  if (confirm(`Delete this user? ${user_id}`)) {
    await fetch(`/api/admin/deleteuser?user_id=${user_id}`, { method: 'DELETE' })
    fetchUsers()
  }
}

const openEdit = (user) => {
  editing.value = true
  editData.value = { ...user }
}

const updateUser = async () => {
  await fetch(`/api/admin/updateuser?user_id=${editData.value.user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editData.value),
  })
  editing.value = false
  fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.table-container::-webkit-scrollbar {
  display: none;
}
.table-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Bouncing animation for the logo */
.bouncing-logo {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Optional: Add pulse effect to make it more playful */
.bouncing-logo img {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
