import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

// Create a mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/demos', component: { template: '<div>Demos</div>' } },
    { path: '/testing', component: { template: '<div>Testing</div>' } }
  ]
})

describe('App.vue', () => {
  it('renders navigation correctly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    // Wait for router to be ready
    await router.isReady()

    // Check if navigation elements exist
    expect(wrapper.find('.navbar').exists()).toBe(true)
    expect(wrapper.find('.brand-link').text()).toBe('Personal Website')
    
    // Check navigation links
    const navLinks = wrapper.findAll('.nav-link')
    expect(navLinks).toHaveLength(4) // Updated to 4 for Home, Demos, Testing, About
    expect(navLinks[0].text()).toBe('Home')
    expect(navLinks[1].text()).toBe('Demos')
    expect(navLinks[2].text()).toBe('Testing')
    expect(navLinks[3].text()).toBe('About')
  })

  it('has proper footer content', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()

    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('Personal Website')
    expect(footer.text()).toContain('Vue.js and TypeScript')
  })
})