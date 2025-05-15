<template>
  <div class="bg-white p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Business Analytics</h3>
      <select 
        v-model="timeRange" 
        class="border rounded px-3 py-1 text-sm"
        @change="fetchChartData"
      >
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last Quarter</option>
        <option value="365">Last Year</option>
      </select>
    </div>
    <Bar v-if="chartType === 'bar'" :data="chartData" :options="chartOptions" />
    <Line v-else :data="chartData" :options="chartOptions" />
    <div class="mt-4 flex gap-2 justify-center">
      <button @click="chartType = 'bar'" class="px-3 py-1 text-sm rounded" :class="chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-100'">
        Bar View
      </button>
      <button @click="chartType = 'line'" class="px-3 py-1 text-sm rounded" :class="chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-100'">
        Line View
      </button>
    </div>
  </div>
</template>

<script setup>
import { Bar, Line } from 'vue-chartjs'
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
)

const props = defineProps({
  chartData: Object,
  loading: Boolean
})

const emit = defineEmits(['time-range-changed'])

const timeRange = ref('30')
const chartType = ref('bar')
const chartData = computed(() => ({
  labels: props.chartData.dates.map(date => formatDateLabel(date)),
  datasets: [
      {
        label: 'New Users',
        data: props.chartData.users,
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Pending Orders',
        data: props.chartData.orders.pending,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Processing Orders',
        data: props.chartData.orders.processing,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Shipped Orders',
        data: props.chartData.orders.shipped,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Delivered Orders',
        data: props.chartData.orders.delivered,
        backgroundColor: '#059669',
        borderColor: '#059669',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'New Products',
        data: props.chartData.products,
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Shipments',
        data: props.chartData.shipments,
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
}))

// Sample data structure - this would come from your API
const sampleData = {
  dates: ['2023-05-01', '2023-05-02', '2023-05-03'],
  users: [5, 8, 12],
  orders: {
    pending: [2, 3, 1],
    processing: [1, 2, 3],
    shipped: [0, 1, 2],
    delivered: [0, 0, 1],
    cancelled: [0, 0, 0],
    refunded: [0, 0, 0]
  },
  products: [10, 15, 20],
  shipments: [0, 1, 3]
}

onMounted(() => {
  fetchChartData()
})

const fetchChartData = async () => {
  emit('time-range-changed', timeRange.value)
  // In a real app, you would fetch data from your API here
  // For now we'll use the sample data
  updateChartWithData(sampleData)
}

const updateChartWithData = (data) => {
  chartData.value = {
    labels: data.dates.map(date => formatDateLabel(date)),
    datasets: [
      {
        label: 'New Users',
        data: data.users,
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Pending Orders',
        data: data.orders.pending,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Processing Orders',
        data: data.orders.processing,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Shipped Orders',
        data: data.orders.shipped,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Delivered Orders',
        data: data.orders.delivered,
        backgroundColor: '#059669',
        borderColor: '#059669',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'New Products',
        data: data.products,
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Shipments',
        data: data.shipments,
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  }
}

const formatDateLabel = (dateString) => {
  const date = new Date(dateString)
  return timeRange.value === '365' 
    ? date.toLocaleDateString('default', { month: 'short' })
    : date.toLocaleDateString('default', { day: 'numeric', month: 'short' })
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false
    },
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Users/Products'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: 'Orders/Shipments'
      }
    }
  }
}
</script>

<style scoped>
canvas {
  height: 300px !important;
}
</style>
