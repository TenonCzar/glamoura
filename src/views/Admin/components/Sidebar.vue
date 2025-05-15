<template>
  <div
    class="w-64 bg-transparent border-r-2 rounded-r text-gray-200 space-y-4 md:flex flex-col gap-8 hidden"
  >
    <div class="head text-2xl font-bold mb-4 p-4 rounded-t text-gray-200">Admin Panel</div>
    <div class="admin-links flex flex-col gap-8 p-4">
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
        to="/admin/category"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
        >Category</RouterLink
      >
      <RouterLink
        to="/admin/orders"
        class="block py-2 hover:bg-[#2c0865] hover:text-white hover:px-4 rounded"
        >Orders</RouterLink
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
    </div>
  </div>
</template>
