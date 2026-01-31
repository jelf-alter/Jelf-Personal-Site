import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WebSocketDemo from '../WebSocketDemo.vue'

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.OPEN
}

// Mock the WebSocket constructor
global.WebSocket = vi.fn(() => mockWebSocket) as any

describe('WebSocketDemo Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders WebSocket demo interface correctly', () => {
    const wrapper = mount(WebSocketDemo)
    
    expect(wrapper.find('.websocket-demo').exists()).toBe(true)
    expect(wrapper.find('.connection-status').exists()).toBe(true)
    expect(wrapper.find('.message-input').exists()).toBe(true)
    expect(wrapper.find('.send-button').exists()).toBe(true)
  })

  it('displays connection status correctly', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Initially should show disconnected
    expect(wrapper.find('.connection-status').text()).toContain('Disconnected')
    
    // Simulate connection
    await wrapper.find('.connect-button').trigger('click')
    expect(wrapper.find('.connection-status').text()).toContain('Connected')
  })

  it('handles message sending correctly', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Connect first
    await wrapper.find('.connect-button').trigger('click')
    
    // Enter message
    const messageInput = wrapper.find('.message-input')
    await messageInput.setValue('Test message')
    
    // Send message
    await wrapper.find('.send-button').trigger('click')
    
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'message',
        data: 'Test message',
        timestamp: expect.any(String)
      })
    )
  })

  it('displays message history correctly', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Connect and send a message
    await wrapper.find('.connect-button').trigger('click')
    const messageInput = wrapper.find('.message-input')
    await messageInput.setValue('Test message')
    await wrapper.find('.send-button').trigger('click')
    
    // Check message appears in history
    expect(wrapper.find('.message-history').text()).toContain('Test message')
  })

  it('handles connection errors gracefully', async () => {
    // Mock WebSocket constructor to throw error
    global.WebSocket = vi.fn(() => {
      throw new Error('Connection failed')
    }) as any

    const wrapper = mount(WebSocketDemo)
    
    await wrapper.find('.connect-button').trigger('click')
    
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Connection failed')
  })

  it('cleans up WebSocket connection on unmount', () => {
    const wrapper = mount(WebSocketDemo)
    
    // Connect first
    wrapper.find('.connect-button').trigger('click')
    
    // Unmount component
    wrapper.unmount()
    
    expect(mockWebSocket.close).toHaveBeenCalled()
  })

  it('validates message input correctly', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Connect first
    await wrapper.find('.connect-button').trigger('click')
    
    // Try to send empty message
    await wrapper.find('.send-button').trigger('click')
    
    expect(mockWebSocket.send).not.toHaveBeenCalled()
    expect(wrapper.find('.validation-error').exists()).toBe(true)
  })

  it('handles real-time message updates', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Connect
    await wrapper.find('.connect-button').trigger('click')
    
    // Simulate receiving a message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        data: 'Received message',
        timestamp: new Date().toISOString()
      })
    })
    
    // Trigger the message event handler
    const messageHandler = mockWebSocket.addEventListener.mock.calls
      .find(call => call[0] === 'message')?.[1]
    
    if (messageHandler) {
      messageHandler(messageEvent)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.message-history').text()).toContain('Received message')
    }
  })

  it('maintains connection state correctly', async () => {
    const wrapper = mount(WebSocketDemo)
    
    // Initially disconnected
    expect(wrapper.vm.isConnected).toBe(false)
    
    // Connect
    await wrapper.find('.connect-button').trigger('click')
    expect(wrapper.vm.isConnected).toBe(true)
    
    // Disconnect
    await wrapper.find('.disconnect-button').trigger('click')
    expect(wrapper.vm.isConnected).toBe(false)
  })

  it('formats timestamps correctly in message history', async () => {
    const wrapper = mount(WebSocketDemo)
    
    await wrapper.find('.connect-button').trigger('click')
    
    const messageInput = wrapper.find('.message-input')
    await messageInput.setValue('Timestamped message')
    await wrapper.find('.send-button').trigger('click')
    
    const messageElement = wrapper.find('.message-item')
    expect(messageElement.find('.message-timestamp').exists()).toBe(true)
    expect(messageElement.find('.message-timestamp').text()).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})