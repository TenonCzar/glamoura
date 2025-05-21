<template>
    <div class="min-h-screen bg-gray-50 flex flex-col items-center">
      <!-- Header -->
      <header class="bg-white shadow w-full">
        <div class=" px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">My Dashboard</h1>

          <nav class="text-orange-400">
            <router-link to="/">Shop</router-link>
          </nav>
          <div class="flex items-center space-x-4">
            <button @click="logout" class="text-gray-500 hover:text-gray-700">
              <LogOutIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
  
      <main class="max-w-[90%] mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Orders" 
            :value="userStats.totalOrders" 
            icon="ShoppingBag"
            color="bg-blue-100 text-blue-600"
          />
          <DashboardCard 
            title="Pending Orders" 
            :value="userStats.pendingOrders" 
            icon="Clock"
            color="bg-yellow-100 text-yellow-600"
          />
          <DashboardCard 
            title="Wishlist Items" 
            :value="userStats.wishlistItems" 
            icon="Heart"
            color="bg-red-100 text-red-600"
          />
          <DashboardCard 
            title="Loyalty Points" 
            :value="userStats.loyaltyPoints" 
            icon="Award"
            color="bg-purple-100 text-purple-600"
          />
        </div>
  
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-6 flex flex-col gap-12">
            <!-- Recent Orders -->
            <div class="text-gray-700 shadow rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium">Recent Orders</h2>
              </div>
              <div class="divide-y divide-gray-200">
                <OrderItem 
                  v-for="order in recentOrders" 
                  :key="order.id"
                  :order="order"
                  class="hover:bg-gray-50 hover:text-gray-700 transition-colors"
                />
              </div>
              <div class="px-6 py-4 border-t border-gray-200 text-right">
                <router-link 
                  to="/orders" 
                  class="text-sm font-medium text-blue-400 hover:text-blue-500"
                >
                  View all orders →
                </router-link>
              </div>
            </div>
  
            <!-- Recommended Products -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Recommended For You</h2>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                <ProductCard 
                  v-for="product in recommendedProducts"
                  :key="product.id"
                  :product="product"
                />
              </div>
            </div>
          </div>
  
          <!-- Right Column -->
          <div class="space-y-6 flex flex-col gap-12">
            <!-- Account Summary -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Account Summary</h2>
              </div>
              <div class="p-6 flex flex-col gap-6">
                <div class="flex items-center space-x-4 mb-6 gap-4 justify-between">
                  <div class="flex-shrink-0">
                    <div class="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon class="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ user.name }}</h3>
                    <p class="text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
                <div class="space-y-4 flex flex-col gap-4 text-blue-400">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Member since</span>
                    <span class="font-medium">{{ formatDate(user.joinDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Default Address</span>
                    <span class="font-medium text-right">{{ user.defaultAddress }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Phone Number</span>
                    <span class="font-medium">{{ user.phone }}</span>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4 border-t border-gray-200">
                <router-link 
                  to="/account" 
                  class="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Edit Account Details →
                </router-link>
              </div>
            </div>
  
            <!-- Quick Actions -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div class="p-6 grid grid-cols-2 gap-4">
                <ActionButton 
                icon="ShoppingCart"
                label="Track Order"
                @click="trackOrder"
              />
              <ActionButton 
                icon="RefreshCw"
                label="Return Item"
                @click="startReturn"
              />
              <ActionButton 
                icon="MessageSquare"
                label="Contact Support"
                @click="contactSupport"
              />
              <ActionButton 
                icon="Gift"
                label="View Rewards"
                @click="viewRewards"
              />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  // Components
  import DashboardCard from '@/views/Users/components/DashboardCard.vue'
  import OrderItem from '@/views/Users/components/OrderItem.vue'
  import ProductCard from '@/views/Users/components/ProductCard.vue'
  import ActionButton from '@/views/Users/components/ActionButton.vue'
  
  // Mock data - replace with API calls
  const user = ref({
    name: 'Tenon Czar',
    email: 'tenonczar@gmail.com',
    phone: '+234 8158867576',
    joinDate: '2025-05-15',
    defaultAddress: '123 Main St, Apt 4B\nNew York, NY 10001'
  })
  
  const userStats = ref({
    totalOrders: 12,
    pendingOrders: 2,
    wishlistItems: 5,
    loyaltyPoints: 1250
  })
  
  const recentOrders = ref([
    {
      id: 'ORD-12345',
      date: '2023-05-15',
      status: 'Delivered',
      items: 3,
      total: 14900,
      trackingNumber: '1Z999AA10123456784'
    },
    {
      id: 'ORD-12344',
      date: '2023-05-10',
      status: 'Shipped',
      items: 2,
      total: 8900,
      trackingNumber: '1Z999AA10123456785'
    }
  ])
  
  const recommendedProducts = ref([
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 9900,
      image: 'https://example.com/headphones.jpg',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 19900,
      image: 'https://example.com/watch.jpg',
      rating: 4.2
    },
    {
      id: 3,
      name: 'Bluetooth Speaker',
      price: 5900,
      image: 'https://example.com/speaker.jpg',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Phone Case',
      price: 2400,
      image: 'https://example.com/case.jpg',
      rating: 4.0
    }
  ])
  
  // Methods
  const logout = () => {
    console.log('Logging out...')
    // Add your logout logic here
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  const trackOrder = () => {
    console.log('Tracking order...')
  }
  
  const startReturn = () => {
    console.log('Starting return...')
  }
  
  const contactSupport = () => {
    console.log('Contacting support...')
  }
  
  const viewRewards = () => {
    console.log('Viewing rewards...')
  }
  
  // Fetch data on component mount
  onMounted(() => {
    // In a real app, you would fetch user data here
    // fetchUserData();
  })
  </script>