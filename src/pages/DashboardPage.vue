<template>
  <q-page class="dashboard-page">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <q-icon name="psychology" size="48px" color="primary" class="q-mr-md" />
            <div>
              <h4 class="welcome-title">
                Bem-vindo, {{ sanitizedUserName }}!
                <q-chip
                  :color="authStore.isAdmin ? 'orange' : 'primary'"
                  text-color="white"
                  :icon="authStore.isAdmin ? 'admin_panel_settings' : 'person'"
                  class="q-ml-sm"
                >
                  {{ authStore.isAdmin ? 'Administrador' : 'Usuário' }}
                </q-chip>
              </h4>
              <p class="welcome-subtitle">
                {{
                  authStore.isAdmin
                    ? 'Painel Administrativo do SmartPicks'
                    : 'Painel de controle do SmartPicks'
                }}
              </p>
            </div>
          </div>

          <div class="header-actions">
            <q-btn flat icon="person" :label="sanitizedUserEmail" class="user-info-btn" no-caps>
              <q-menu>
                <q-list>
                  <q-item clickable @click="logout">
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>Sair</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <div class="stats-grid">
          <!-- Card de Estatísticas -->
          <q-card class="stat-card">
            <q-card-section class="flex items-center">
              <q-icon name="analytics" size="40px" color="primary" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ statsData.decisions }}</div>
                <div class="stat-label">Decisões Tomadas</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="stat-card">
            <q-card-section class="flex items-center">
              <q-icon name="trending_up" size="40px" color="positive" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ statsData.accuracy }}%</div>
                <div class="stat-label">Precisão</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="stat-card">
            <q-card-section class="flex items-center">
              <q-icon name="schedule" size="40px" color="warning" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ statsData.timeSaved }}h</div>
                <div class="stat-label">Tempo Economizado</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Área de Conteúdo Principal -->
        <div class="main-content-area">
          <q-card class="content-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="dashboard" class="q-mr-sm" />
                Dashboard Principal
              </div>

              <p class="content-text">Esta é sua área restrita do SmartPicks. Aqui você pode:</p>

              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Visualizar suas estatísticas de decisões</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Acessar ferramentas inteligentes de escolha</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Gerenciar suas preferências</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Card de Ações Rápidas -->
          <q-card class="content-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="flash_on" class="q-mr-sm" />
                Ações Rápidas
              </div>

              <div class="actions-grid">
                <q-btn
                  unelevated
                  color="primary"
                  icon="psychology"
                  label="Nova Decisão"
                  class="action-btn"
                  no-caps
                />

                <q-btn
                  unelevated
                  color="secondary"
                  icon="history"
                  label="Histórico"
                  class="action-btn"
                  no-caps
                />

                <q-btn
                  unelevated
                  color="accent"
                  icon="settings"
                  label="Configurações"
                  class="action-btn"
                  no-caps
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Seção Administrativa (apenas para admins) -->
          <q-card v-if="authStore.isAdmin" class="content-card admin-section">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="admin_panel_settings" class="q-mr-sm" color="orange" />
                Painel Administrativo
              </div>

              <p class="content-text">
                Como administrador, você tem acesso a funcionalidades avançadas:
              </p>

              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="people" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Gerenciar usuários do sistema</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="analytics" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Visualizar relatórios completos</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="security" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Configurações de segurança</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="tune" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Configurações do sistema</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="admin-actions-grid q-mt-lg">
                <q-btn
                  unelevated
                  color="orange"
                  icon="people"
                  label="Gerenciar Usuários"
                  class="action-btn"
                  no-caps
                />

                <q-btn
                  unelevated
                  color="orange"
                  icon="bar_chart"
                  label="Relatórios"
                  class="action-btn"
                  no-caps
                />

                <q-btn
                  unelevated
                  color="orange"
                  icon="settings"
                  label="Configurações"
                  class="action-btn"
                  no-caps
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'DashboardPage',

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // Dados das estatísticas (mockado)
    const statsData = ref({
      decisions: 247,
      accuracy: 94,
      timeSaved: 156,
    });

    // Computed para dados sanitizados do usuário
    const sanitizedUserName = computed(() => {
      return authStore.user?.name ? authStore.sanitizeInput(authStore.user.name) : 'Usuário';
    });

    const sanitizedUserEmail = computed(() => {
      return authStore.user?.email ? authStore.sanitizeInput(authStore.user.email) : '';
    });

    // Verificar autenticação ao montar componente
    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        try {
          const isValid = await authStore.validateToken();
          if (!isValid) {
            toast.error('Sessão expirada. Faça login novamente.');
            await router.push('/');
            return;
          }
        } catch {
          toast.error('Erro ao validar sessão. Faça login novamente.');
          await router.push('/');
          return;
        }
      }
    });

    // Função de logout
    const logout = async () => {
      try {
        await authStore.logout();
        await router.push('/');
      } catch (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro ao fazer logout.');
      }
    };

    return {
      statsData,
      sanitizedUserName,
      sanitizedUserEmail,
      authStore,
      logout,
    };
  },
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.dashboard-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section {
  display: flex;
  align-items: center;
}

.welcome-title {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.welcome-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.user-info-btn {
  color: #34495e;
  font-weight: 500;
}

.dashboard-content {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
  margin-top: 0.25rem;
}

.main-content-area {
  display: grid;
  gap: 1.5rem;
}

.content-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-text {
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  height: 60px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
}

.admin-section {
  border-left: 4px solid #ff9800;
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
}

.admin-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .welcome-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stat-card .q-card-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
