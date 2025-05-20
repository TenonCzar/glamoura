import { createRouter, createWebHistory } from 'vue-router'
import CreateAdmin from '../views/Admin/SignUp.vue'
import AdminLayout from '../views/Admin/Layout/AdminLayout.vue'
import DashboardHome from '/src/views/Admin/Pages/DashboardHome.vue'
import Users from '/src/views/Admin/Pages/Users.vue'
import Orders from '/src/views/Admin/Pages/Orders.vue'
import AddProducts from '/src/views/Admin/Pages/AddProducts.vue'
import Category from '/src/views/Admin/Pages/CreateCategory.vue'
import ProductPreview from '/src/views/Admin/components/ProductPreview.vue'
import Inventory from '/src/views/Admin/Pages/Inventory.vue'
import Support from '/src/views/Admin/Pages/Suppport.vue'
import Settings from '/src/views/Admin/Pages/Settings.vue'
import Products from '/src/views/Admin/Pages/Products.vue'
import EditProduct from '/src/views/Admin/Pages/[id].vue'
import { useAuth } from '/src/stores/auth'
import Signup from '/src/views/SignUp.vue'
import Login from '/src/views/LogIn.vue'

// Users Routes
import Dashboard from '/src/views/Users/Dashboard.vue'
import Userorders from '/src/views/Users/Dashboard.vue'
import UserSettings from '/src/views/Users/Dashboard.vue'

const routes = [
  { path: '/auth', component: Login },
  { path: '/signup', component: Signup },
  { path: '/ada', component: CreateAdmin },
  { path: '/products/:slug', component: ProductPreview },
  {
    path: '/',
    component: () => import('/src/views/HomeView.vue'),
    // meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout,
    // meta: { requiresAuth: true },
    children: [
      { path: '', component: DashboardHome },
      { path: 'users', component: Users },
      { path: 'orders', component: Orders },
      { path: 'addproduct', component: AddProducts },
      { path: 'allproducts', component: Products },
      { path: 'editproduct/', component: EditProduct },
      { path: 'category', component: Category },
      { path: 'inventory', component: Inventory },
      { path: 'support', component: Support },
      { path: 'settings', component: Settings },
    ],
  },
  {
    path: '/user',
    component: Dashboard,
    // meta: { requiresAuth: true },
    children: [
      { path: '', component: Dashboard },
      { path: 'orders', component: Userorders },
      { path: 'category', component: Category },
      { path: 'support', component: Support },
      { path: 'settings', component: UserSettings },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuth()
  if (to.meta.requiresAuth && !auth.token) {
    next('/auth')
  } else {
    next()
  }
})

export default router
