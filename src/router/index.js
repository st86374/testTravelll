import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首頁' },
  },
  {
    path: '/restaurants',
    name: 'restaurants',
    component: () => import('../views/RestaurantsView.vue'),
    meta: { title: '餐廳清單' },
  },
  {
    path: '/restaurants/:id',
    name: 'restaurant-detail',
    component: () => import('../views/RestaurantDetailView.vue'),
    meta: { title: '餐廳' },
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('../views/PostsView.vue'),
    meta: { title: '文章' },
  },
  {
    path: '/posts/:slug',
    name: 'post-detail',
    component: () => import('../views/PostDetailView.vue'),
    meta: { title: '文章' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { title: '關於' },
  },
  {
    path: '/sudoku',
    name: 'sudoku',
    component: () => import('../views/SudokuView.vue'),
    meta: { title: '數獨小遊戲' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const base = 'Tomm 的食記與筆記'
  document.title = to.meta?.title ? `${to.meta.title}・${base}` : base
})

export default router
