<template>
  <div class="flex h-full min-h-screen bg-[#1c013a]">
    <Sidebar />

    <div class="flex flex-col w-full">
      <ResponseDisplayer ref="responseDisplayer" />
      <Topbar />
      <main class="p-4 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/views/Admin/components/Sidebar.vue'
import Topbar from '@/views/Admin/components/TopBar.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>
