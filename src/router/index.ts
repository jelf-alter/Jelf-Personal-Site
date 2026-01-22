import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home - Personal Website',
      description: 'Professional portfolio and demo platform showcasing full-stack development capabilities'
    }
  },
  {
    path: '/demos',
    name: 'demos',
    component: () => import('../views/DemosView.vue'),
    meta: {
      title: 'Demos - Personal Website',
      description: 'Interactive demonstrations of various technologies and development capabilities'
    }
  },
  {
    path: '/demos/:id',
    name: 'demo-detail',
    component: () => import('../views/DemoDetailView.vue'),
    meta: {
      title: 'Demo Detail - Personal Website',
      description: 'Detailed view of a specific demo application'
    }
  },
  {
    path: '/testing',
    name: 'testing',
    component: () => import('../views/TestingView.vue'),
    meta: {
      title: 'Testing Dashboard - Personal Website',
      description: 'Public visibility into code quality, test coverage, and testing practices'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'About - Personal Website',
      description: 'Learn more about the developer and the technologies used in this website'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Personal Website',
      description: 'The requested page could not be found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription && to.meta?.description) {
    metaDescription.setAttribute('content', to.meta.description as string)
  }
  
  next()
})

export default router