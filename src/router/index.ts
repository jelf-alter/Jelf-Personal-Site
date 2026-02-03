import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { demoRegistry } from '@/services/demoRegistry'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Personal Website - Full-Stack Developer Portfolio',
      description: 'Professional portfolio showcasing full-stack development capabilities, data processing demos, and comprehensive testing practices',
      keywords: 'developer, portfolio, Vue.js, TypeScript, testing, data processing, ELT pipeline',
      type: 'website'
    }
  },
  {
    path: '/demos',
    name: 'demos',
    component: () => import('../views/DemosView.vue'),
    meta: {
      title: 'Demos - Personal Website',
      description: 'Interactive demonstrations of various technologies and development capabilities',
      keywords: 'demos, applications, Vue.js, TypeScript, ELT pipeline, data processing',
      type: 'website'
    }
  },
  {
    path: '/demos/:id',
    name: 'demo-detail',
    component: () => import('../views/DemoDetailView.vue'),
    meta: {
      title: 'Demo Detail - Personal Website',
      description: 'Detailed view of a specific demo application',
      type: 'article'
    },
    beforeEnter: (to, _from, next) => {
      // Validate that the demo exists
      const demoId = to.params.id as string
      const demo = demoRegistry.getDemo(demoId)
      
      if (!demo) {
        // Demo not found, redirect to 404
        next({ name: 'not-found' })
        return
      }
      
      // Update meta tags with demo-specific information
      to.meta.title = `${demo.name} - Demo - Personal Website`
      to.meta.description = demo.description
      to.meta.keywords = `${demo.name}, demo, ${demo.technologies.join(', ')}`
      
      next()
    }
  },
  {
    path: '/testing',
    name: 'testing',
    component: () => import('../views/TestingView.vue'),
    meta: {
      title: 'Testing Dashboard - Personal Website',
      description: 'Public visibility into code quality, test coverage, and testing practices',
      keywords: 'testing, code quality, coverage, unit tests, integration tests, property-based testing',
      type: 'website'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'About - Personal Website',
      description: 'Learn more about the developer and the technologies used in this website',
      keywords: 'about, developer, technologies, Vue.js, TypeScript, full-stack',
      type: 'profile'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Personal Website',
      description: 'The requested page could not be found',
      keywords: '404, not found, error',
      type: 'website'
    }
  }
]

const router = createRouter({
  history: createWebHistory((import.meta as any).env?.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, _from, next) => {
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