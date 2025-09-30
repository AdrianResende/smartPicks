<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-animation">
        <div class="floating-icon">🔍</div>
        <div class="error-number">404</div>
      </div>

      <div class="error-content">
        <h1 class="error-title">Página não encontrada</h1>
        <p class="error-subtitle">
          Ops! A página que você está procurando não existe ou foi movida.
        </p>

        <div class="error-suggestions">
          <q-icon name="lightbulb" size="24px" color="warning" class="q-mr-sm" />
          <div>
            <p class="suggestion-title">Algumas sugestões:</p>
            <ul class="suggestion-list">
              <li>Verifique se o endereço foi digitado corretamente</li>
              <li>A página pode ter sido removida ou renomeada</li>
              <li>Tente voltar à página inicial</li>
            </ul>
          </div>
        </div>

        <div class="error-actions">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            icon="home"
            label="Voltar ao Início"
            to="/"
            class="q-mr-md"
            no-caps
          />

          <q-btn
            outline
            color="primary"
            size="lg"
            icon="refresh"
            label="Recarregar"
            @click="reloadPage"
            no-caps
          />
        </div>
      </div>

      <div class="error-footer">
        <q-icon name="favorite" color="red" class="q-mr-xs" />
        <span class="footer-text">SmartPicks - Sempre aqui para você</span>
      </div>
    </div>

    <!-- Elementos decorativos -->
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
    <div class="decoration decoration-3"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorNotFound',

  setup() {
    const reloadPage = () => {
      window.location.reload();
    };

    return {
      reloadPage,
    };
  },
});
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.error-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.error-animation {
  margin-bottom: 2rem;
  position: relative;
}

.floating-icon {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
  margin-bottom: 1rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: #667eea;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1;
  margin: 0;
}

.error-content {
  margin: 2rem 0;
}

.error-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-subtitle {
  color: #7f8c8d;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-suggestions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  display: flex;
  align-items: flex-start;
  text-align: left;
}

.suggestion-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.suggestion-list {
  color: #7f8c8d;
  padding-left: 1rem;
  margin: 0;
}

.suggestion-list li {
  margin-bottom: 0.5rem;
}

.error-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.footer-text {
  font-size: 0.9rem;
}

/* Elementos decorativos */
.decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

/* Animações */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .error-page {
    padding: 1rem;
  }

  .error-container {
    padding: 2rem 1.5rem;
  }

  .error-number {
    font-size: 6rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-subtitle {
    font-size: 1rem;
  }

  .error-suggestions {
    flex-direction: column;
    text-align: center;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions .q-btn {
    width: 100%;
    margin-right: 0 !important;
  }
}

@media (max-width: 480px) {
  .floating-icon {
    font-size: 3rem;
  }

  .error-number {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }
}
</style>
