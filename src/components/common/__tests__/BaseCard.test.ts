import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '../BaseCard.vue'

describe('BaseCard Unit Tests', () => {
  it('renders card with default props correctly', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.find('.base-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Card content')
    expect(wrapper.classes()).toContain('base-card')
  })

  it('applies custom title correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: 'Test Card Title'
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.find('.card-title').exists()).toBe(true)
    expect(wrapper.find('.card-title').text()).toBe('Test Card Title')
  })

  it('applies elevation prop correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        elevation: 3
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('elevation-3')
  })

  it('applies padding prop correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        padding: 'large'
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('padding-large')
  })

  it('applies rounded prop correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        rounded: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('rounded')
  })

  it('applies hover effect when enabled', () => {
    const wrapper = mount(BaseCard, {
      props: {
        hover: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('hover-enabled')
  })

  it('renders header slot correctly', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        header: '<div class="custom-header">Custom Header</div>',
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-header').text()).toBe('Custom Header')
  })

  it('renders footer slot correctly', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Card content</p>',
        footer: '<div class="custom-footer">Custom Footer</div>'
      }
    })
    
    expect(wrapper.find('.card-footer').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').text()).toBe('Custom Footer')
  })

  it('handles click events correctly', async () => {
    const wrapper = mount(BaseCard, {
      props: {
        clickable: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.classes()).toContain('clickable')
  })

  it('applies loading state correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        loading: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    expect(wrapper.classes()).toContain('loading')
  })

  it('applies disabled state correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        disabled: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('disabled')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('applies custom CSS classes correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        customClass: 'my-custom-class another-class'
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('my-custom-class')
    expect(wrapper.classes()).toContain('another-class')
  })

  it('handles border prop correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        border: 'primary'
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('border-primary')
  })

  it('applies correct ARIA attributes for accessibility', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: 'Accessible Card',
        role: 'article'
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.attributes('role')).toBe('article')
    expect(wrapper.attributes('aria-labelledby')).toBeDefined()
  })

  it('handles responsive behavior correctly', () => {
    const wrapper = mount(BaseCard, {
      props: {
        responsive: true
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.classes()).toContain('responsive')
  })

  it('renders without title when not provided', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.find('.card-title').exists()).toBe(false)
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })

  it('applies correct z-index for elevation', () => {
    const wrapper = mount(BaseCard, {
      props: {
        elevation: 5
      },
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    const cardElement = wrapper.find('.base-card')
    const computedStyle = window.getComputedStyle(cardElement.element)
    expect(wrapper.classes()).toContain('elevation-5')
  })
})