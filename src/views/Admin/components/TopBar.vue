<template>
  <div class="shadow p-4 bg-base-300 flex justify-between items-center text-gray-200 border-b max-w-[100vw]">
    <h1 class="text-xl font-semibold">Admin Dashboard</h1>
    <Icon @click="toggleNav" icon="mdi:menu" class="text-3xl cursor-pointer md:hidden" />
  </div>
  <Transition name="slide-down" class="bg-[#2c0870] min-h-[90vh]">
    <div class="nav flex flex-col w-[50vw] bg-[#2c0870] absolute pt-6 top-16 md:hidden" v-if="openNav">
      <div class="admin-links flex flex-col gap-12 p-4">
        <RouterLink
          to="/admin"
          class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Dashboard</RouterLink
        >
        <RouterLink
        to="/admin/users"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Users</RouterLink
        >
        <RouterLink
          to="/admin/orders"
          class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Orders</RouterLink
        >
        <RouterLink
        to="/admin/addproduct"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Create Product</RouterLink
        >
        <RouterLink
        to="/admin/allproducts"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Product</RouterLink
        >
        <RouterLink
        to="/admin/inventory"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Inventory</RouterLink
        >
        <RouterLink
          to="/admin/support"
          class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Support</RouterLink
        >
        <RouterLink
        to="/admin/settings"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
          >Settings</RouterLink
        >
        <button @click="logout" class="text-red-600 font-semibold bg-white">Logout</button>
      </div>
    </div>
  </Transition>

  <div class="adminUser">
    <div class="img">
      <img src="" alt="">
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const openNav = ref(false)

const toggleNav = () => {
  openNav.value = !openNav.value
}
const logout = () => {
  // handle logout logic
  alert('Logged out!')
}
</script>

<style scoped>
/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
