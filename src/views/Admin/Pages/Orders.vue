<template>
    <div class="main w-[90%] flex flex-col gap-6 place-self-center">
        <ResponseDisplayer ref="responseDisplayer" />
        <h3 class="text-2xl font-bold mb-4 px-4 w-fit">All Orders</h3>
        <transition name="bounce">
            <div 
                v-if="isLoading" 
                class="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50"
            >
                <div class="bouncing-logo">
                    <img 
                        src="/src/assets/logo.webp" 
                        alt="Loading..." 
                        class="h-24 w-auto"
                    />
                </div>
            </div>
        </transition>
        <div class="flex table-container flex-col gap-6 w-full overflow-x-scroll">
      <table class="w-full border text-lg whitespace-nowrap">
        <thead class="">
          <tr>
            <th class="px-4 py-2 text-left border">Order NO</th>
            <th class="px-4 py-2 text-left border">Customer</th>
            <th class="px-4 py-2 text-left border">Date</th>
            <th class="px-4 py-2 text-left border">Amount</th>
            <th class="px-4 py-2 text-left border">Status</th>
            <th class="px-4 py-2 text-left border">Update</th>
          </tr>
        </thead>
        <tbody class="">
          <tr v-for="order in recentOrders" :key="order.id" class="border-t">
            <td class="px-4 py-2 border">{{ order.order_number }}</td>
            <td class="px-4 py-2 border">{{ order.customer_name }}</td>
            <td class="px-4 py-2 border">{{ order.created_at }}</td>
            <td class="px-4 py-2 border">₦{{ order.total_amount }}</td>
            <td class="px-4 py-2 border border-gray-200 text-gray-900" :class="{
  'bg-amber-400': order.status.toLowerCase() === 'pending',
  'bg-green-400': order.status.toLowerCase() === 'shipped',
  'bg-blue-400': order.status.toLowerCase() === 'delivered',
  'bg-gray-400': order.status.toLowerCase() === 'processing',
  'bg-red-400': order.status.toLowerCase() === 'cancelled',
  'bg-purple-400': order.status.toLowerCase() === 'refunded',
}">{{ order.status }}</td>
<td class="px-4 py-2 border">
  <select
    v-model="order.status"
    @change="updateStatus(order)"
    class="rounded border p-1 bg-transparent"
  >
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
    <option value="refunded">Refunded</option>
  </select>
</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Bar -->
<div v-if="totalPages > 1" class="flex gap-2 mt-4 px-4">
  <button
    @click="changePage(currentPage - 1)"
    :disabled="currentPage === 1"
    class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Prev
  </button>

  <button
    v-for="page in visiblePages"
    :key="page"
    @click="changePage(page)"
    :class="[
      'px-3 py-1 rounded',
      page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100'
    ]"
  >
    {{ page }}
  </button>

  <button
    @click="changePage(currentPage + 1)"
    :disabled="currentPage === totalPages"
    class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
    </div></div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
import ResponseDisplayer from '/src/components/ResponseDisplayer.vue'

const responseDisplayer = ref(null)
const recentOrders = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(true)

const fetchOrders = async (page = 1) => {
    isLoading.value = true
    try {
        const res = await fetch(`/api/admin/orders?page=${page}`)
        const data = await res.json()

        if (data.success) {
            recentOrders.value = data.recentOrders
            totalPages.value = data.pagination.totalPages
            currentPage.value = data.pagination.currentPage
        }
    } catch (error) {
        console.error('Error fetching orders:', error)
    } finally {
        isLoading.value = false // Hide loader when done
    }
}

const updateStatus = async (order) => {
  try {
    const res = await fetch('/api/admin/orderstats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.order_id,
        status: order.status
      })
    })

    const data = await res.json()
    if (!data.success) {
        responseDisplayer.value.showError('Failed to update status: ' + data.error)
    } else{
        responseDisplayer.value.showSuccess(data.message)
    }
  } catch (err) {
    responseDisplayer.value.showError(err.message)
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchOrders(page)
  }
}

// Optional: show a range of nearby pages (like 1 2 3 4 5)
const visiblePages = computed(() => {
  const pages = []
  const range = 2 // how many pages to show before and after current
  const start = Math.max(1, currentPage.value - range)
  const end = Math.min(totalPages.value, currentPage.value + range)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

onMounted(() => fetchOrders())
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