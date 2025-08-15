<template>
  <div class="not-found">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card">
            <div class="card-body">
              <div class="mb-4">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
              </div>
              <h1 class="display-4 mb-3">404</h1>
              <h2 class="mb-3">Page Not Found</h2>
              <p class="lead mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div class="d-grid gap-2 d-md-block">
                <router-link to="/" class="btn btn-primary">
                  <i class="bi bi-house me-1"></i>
                  Go Home
                </router-link>
                <button class="btn btn-outline-secondary" @click="goBack">
                  <i class="bi bi-arrow-left me-1"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      window.history.back()
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}
</style> 