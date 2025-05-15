<template>
    <div class="response-displayer">
      <transition name="slide-down">
        <div 
          v-if="showResponse"
          :class="['response-message', responseType]"
          @click="dismiss"
        >
          {{ responseMessage }}
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ResponseDisplayer',
    data() {
      return {
        showResponse: false,
        responseMessage: '',
        responseType: '' // 'success' or 'error'
      }
    },
    methods: {
      showSuccess(message) {
        this.responseMessage = message
        this.responseType = 'success'
        this.showResponse = true
        this.autoDismiss()
      },
      showError(message) {
        this.responseMessage = message
        this.responseType = 'error'
        this.showResponse = true
        this.autoDismiss()
      },
      dismiss() {
        this.showResponse = false
      },
      autoDismiss() {
        setTimeout(() => {
          this.dismiss()
        }, 3000) // Auto dismiss after 5 seconds
      }
    }
  }
  </script>
  
  <style scoped>
  .response-displayer {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: 100%;
    max-width: 500px;
  }
  
  .response-message {
    padding: 15px 20px;
    margin: 10px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
  
  .success {
    background-color: #4CAF50;
  }
  
  .error {
    background-color: #F44336;
  }
  
  .slide-down-enter-active, .slide-down-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-down-enter-from, .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  
  .slide-down-enter-to, .slide-down-leave-from {
    opacity: 1;
    transform: translateY(0);
  }
  </style>