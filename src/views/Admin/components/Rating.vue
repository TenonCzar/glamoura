<template>
  <div class="flex flex-col">
    <h2 class="text-sm">Leave a Review</h2>

    <div class="p-t">
      <span
        v-for="star in 5"
        :key="star"
        class="star"
        :class="{ active: star <= selectedStars }"
        @click="selectStars(star)"
      >
        ★
      </span>
    </div>

    <transition name="slide-down">
      <div v-if="selectedStars > 0" class="review-form">
        <textarea
          v-model="reviewMessage"
          placeholder="Share your experience..."
          class="review-input outline-1 outline-blue-400 rounded-xl"
        ></textarea>
        <button @click="submitReview" class="submit-btn" :disabled="!reviewMessage.trim()">
          Submit Review
        </button>
      </div>
    </transition>

    <div v-if="submitted" class="thank-you-message">Thank you for your review!</div>
  </div>
</template>

<script>
export default {
  name: 'Review',
  data() {
    return {
      selectedStars: 0,
      reviewMessage: '',
      submitted: false,
    }
  },
  methods: {
    selectStars(starCount) {
      this.selectedStars = starCount
      this.submitted = false
    },
    submitReview() {
      // Here you would typically send the data to your backend
      console.log('Review submitted:', {
        stars: this.selectedStars,
        message: this.reviewMessage,
      })

      // Reset form and show thank you message
      this.submitted = true
      this.selectedStars = 0
      this.reviewMessage = ''

      // Hide thank you message after 3 seconds
      setTimeout(() => {
        this.submitted = false
      }, 3000)
    },
  },
}
</script>

<style scoped>

.star {
  display: inline-block;
  font-size: 15px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
  margin: 0 5px;
}

.star.active {
  color: #ffc107;
}

.star:hover {
  color: #ffc107;
}

.review-form {
  margin-top: 20px;
  overflow: hidden;
}

.review-input {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  margin-bottom: 10px;
  resize: vertical;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

/* Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.thank-you-message {
  margin-top: 20px;
  color: #4caf50;
  font-weight: bold;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
