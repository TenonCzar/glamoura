<template>
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
  <div class="p-6 space-y-8 w-full mx-auto text-gray-700 flex flex-col gap-8">
    <ResponseDisplayer ref="responseDisplayer" />
    <!-- Summary Cards -->
    <div class="summary-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-[100%] border border-amber-300 rounded justify-center items-center p-4">
      <div v-for="(item, index) in summary" :key="index" class="shadow rounded p-4 text-center w-[100%]" :style="{ backgroundColor: item.color, color:item.text }">
        <h2 class="text-xl font-semibold">{{ item.label }}</h2>
        <p class="text-3xl font-bold">{{ item.value }}</p>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="flex table-container flex-col gap-6 w-full overflow-x-scroll">
      <h3 class="text-xl font-bold mb-4 bg-amber-500 text-white px-4 w-fit">Recent Orders</h3>
      <table class="w-full border text-lg whitespace-nowrap">
        <thead>
          <tr class="text-2xl text-gray-200">
            <th class="px-4 py-2 text-left border">Order NO</th>
            <th class="px-4 py-2 text-left border">Customer</th>
            <th class="px-4 py-2 text-left border">Date</th>
            <th class="px-4 py-2 text-left border">Amount</th>
            <th class="px-4 py-2 text-left border">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id" class="border-t text-gray-200">
            <td class="px-4 py-2 border">{{ order.order_number }}</td>
            <td class="px-4 py-2 border">{{ order.customer }}</td>
            <td class="px-4 py-2 border">{{ order.date }}</td>
            <td class="px-4 py-2 border">₦{{ order.amount }}</td>
            <td class="px-4 py-2 border" :class="{
  'bg-amber-400': order.status.toLowerCase() === 'pending',
  'bg-green-400': order.status.toLowerCase() === 'shipped',
  'bg-blue-400': order.status.toLowerCase() === 'delivered',
  'bg-red-400': order.status.toLowerCase() === 'cancelled'
}">{{ order.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recent Reviews -->
    <div>
      <h3 class="text-xl font-bold mb-4">Recent Reviews</h3>
      <ul class="space-y-2">
        <li v-for="review in recentReviews" :key="review.id" class="bg-white shadow rounded p-3">
          <p><strong>{{ review.user }}</strong> - ⭐ {{ review.rating }}</p>
          <p class="text-sm text-gray-600">{{ review.comment }}</p>
        </li>
      </ul>
    </div>

    <SalesChart 
    :chart-data="chartData" :loading="isLoading"  @time-range-changed="fetchChartData" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SalesChart from '/src/views/Admin/components/SalesChart.vue'
const responseDisplayer = ref(null)
// import {Icon} from '@iconify/vue'

const summary = ref([
  { label: 'Total Users', value: 0, color: "#8b5cf6" , text: "white"},
  { label: 'Total Orders', value: 0, color: "#0066ff", text: "white" },
  { label: 'Total Products', value: 0, color: "#ffae00", text: "white"},
  { label: 'Total Shipments', value: 0, color: "#00aa00", text: "white" },
])

const recentOrders = ref([])
const recentReviews = ref([])
const salesData = ref([])
const isLoading = ref(true)
const chartData = ref({ dates: [], users: [], orders: {}, products: [], shipments: [], sales: [] })

const fetchChartData = async (range = '30') => {
  isLoading.value = true
  try {
    const res = await fetch(`/api/admin/chartdata?range=${range}`)
    const data = await res.json()
    if (data.success) {
      chartData.value = data.data
      console.log('Received chart data:', data.data) // Debug log
      responseDisplayer.value.showSuccess("Data Fetched Successfully")
    } else{
      responseDisplayer.value.showError('Failed to update status: ' + data.error)
    }
  } catch (error) {
    responseDisplayer.value.showError(error.message)
    console.error('Error fetching chart data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/admin/dashboard-summary')
    if (!res.ok) throw new Error('Network response was not ok')
    
    const data = await res.json()
    
    if (data.success) {
      summary.value[0].value = data.totalUsers
      summary.value[1].value = data.totalOrders
      summary.value[2].value = data.totalProducts
      summary.value[3].value = data.totalShipments
      recentOrders.value = data.recentOrders
      recentReviews.value = data.recentReviews
      salesData.value = data.salesOverTime
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // You might want to handle the error state here
  }
  fetchChartData()
})
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