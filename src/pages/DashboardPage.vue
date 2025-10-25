<template>
  <q-page class="q-pa-md flex full-height full-width text-white" style="background-color: #B9EAEF;">
    <div class="row justify-center full-width" style="max-width: 1200px; width: 100%;">
      <div class="col-12 col-md-3 q-pr-md q-mb-md">
        <q-card class="q-pa-md text-center shadow-2 bg-white text-dark sidebar-card cursor-pointer"
          @click="goToProfile">
          <div class="text-h6 text-weight-bold q-mb-sm">Seu Perfil</div>
          <UserAvatar :size="'72px'" class="q-mb-sm rounded-circle overflow-hidden" />
          <div class="text-body1 q-mb-xs">{{ authStore.user?.nome || 'Usuário' }}</div>
          <div class="text-grey-7 text-caption">2 Apostas • 90% Precisão</div>
        </q-card>
        <q-card class="q-pa-md q-mt-md shadow-2 bg-white text-dark sidebar-card">
          <div class="text-h6 q-mb-sm align-center justify-center flex">🏆 Top Apostadores</div>
          <q-separator spaced />
          <q-list dense>
            <q-item v-for="(bettor, idx) in topBettors" :key="bettor.user">
              <q-item-section>
                <q-avatar size="32px" class="q-mr-sm rounded-circle overflow-hidden">
                  <img v-if="idx === 0" src="/icons/coroaOuro.png" alt="Coroa Ouro" />
                  <img v-else-if="idx === 1" src="/icons/coroaPrata.png" alt="Coroa Prata" />
                  <img v-else src="/icons/coroaBronze.png" alt="Coroa Cinza" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <div class="text-subtitle2">{{ bettor.user }}</div>
              </q-item-section>
              <q-item-section side>
                <div class="text-grey">{{ bettor.precision }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card v-for="palpite in palpites" :key="palpite.id"
          class="q-pa-md q-mb-md shadow-2 rounded-xl hover-border bg-white text-dark">
          <div class="row items-center no-wrap q-mb-sm">
            <q-avatar size="45px" class="q-mr-sm rounded-circle overflow-hidden">
              <img :src="palpite.avatar" />
            </q-avatar>
            <div>
              <div class="text-weight-medium">{{ palpite.user }}</div>
              <div class="text-grey-7 text-caption">{{ tempoDecorrido(palpite.created_at) }}</div>
            </div>
          </div>

          <div class="text-body1 q-mb-sm">
            {{ palpite.text }}
          </div>
          <q-card class="image-container col-6">
            <q-img :src="palpite.img_url" class="rounded-borders post-image" spinner-color="primary"
              style="width: 100%; height: auto; max-height: 500px; object-fit: contain; border-radius: 1%;"
              @error="onImageError" loading="lazy" crossorigin="anonymous" />
          </q-card>

          <div class="row items-center justify-end q-pl-xl  q-gutter-xs">
            <div class="actions-section row q-gutter-sm">
              <q-btn flat round dense icon="thumb_up" color="grey-7" size="md" class="action-btn">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Curtir
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense icon="thumb_down" color="grey-7" size="md" class="action-btn">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Não Curtir
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense icon="comment" color="grey-7" size="md" class="action-btn"
                @click="openCommentsDialog(palpite)">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Comentários
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense icon="share" color="grey-7" size="md" class="action-btn">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Compartilhar
                </q-tooltip>
              </q-btn>

              <q-btn flat round dense icon="content_copy" color="grey-7" size="md" class="action-btn">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                  Copiar Bet
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>

        <q-dialog v-model="showCommentsDialog" position="bottom">
          <q-card style="width: 100%; max-width: 600px;">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Comentários</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-separator />

            <q-card-section style="max-height: 400px; overflow-y: auto;">
              <div v-if="selectedPalpite?.comments && selectedPalpite.comments.length" class="q-gutter-sm">
                <div v-for="(comment, idx) in selectedPalpite.comments" :key="idx"
                  class="comment-item q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-weight-bold text-primary">{{ comment.user }}</div>
                  <div class="q-mt-xs">{{ comment.text }}</div>
                </div>
              </div>
              <div v-else class="text-center text-grey-6 q-pa-md">
                Nenhum comentário ainda. Seja o primeiro!
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section v-if="selectedPalpite" class="q-pt-sm">
              <q-input dense v-model="selectedPalpite.newComment" placeholder="Escreva um comentário..."
                @keyup.enter="addComment" outlined autofocus>
                <template v-slot:append>
                  <q-btn flat round dense icon="send" color="primary" @click="addComment" />
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';
import UserAvatar from 'src/components/UserAvatar.vue';
import { useEventBus } from 'src/composables/useEventBus';
interface Palpite {
  id: number;
  user_id: number;
  user: string;
  avatar: string;
  titulo: string;
  text: string;
  img_url: string;
  created_at: string;
  comments: { user: string; text: string }[];
  newComment: string;
}

interface Response {
  palpites: Palpite[];
}

const { on, off } = useEventBus();
const router = useRouter();
const authStore = useAuthStore();
const showCommentsDialog = ref(false);
const selectedPalpite = ref<Palpite | null>(null);

const palpites = ref<Palpite[]>([]);

const goToProfile = async () => {
  await router.push('/perfil');
};

function openCommentsDialog(palpite: Palpite) {
  selectedPalpite.value = palpite;
  showCommentsDialog.value = true;
}

async function carregarPalpites() {
  try {
    const response: Response = await authStore.getPalpites();
    const list = Array.isArray(response?.palpites) ? response.palpites : [];

    palpites.value = list.map((p: Palpite) => ({
      id: p.id,
      user_id: p.user_id,
      user: p.user ?? 'Usuário',
      avatar: p.avatar ?? 'https://i.pravatar.cc/150?u=' + p.user_id,
      titulo: p.titulo ?? '',
      text: p.titulo ?? '',
      img_url: p.img_url?.startsWith('http')
        ? p.img_url
        : `${import.meta.env.VITE_API_BASE_URL || ''}${p.img_url}`,
      created_at: p.created_at ?? '',
      comments: [],
      newComment: '',
    }));
  } catch (e) {
    console.error('Erro ao carregar palpites', e);
    toast.error('Erro ao carregar palpites.');
  }
}

const recarregarPalpitesListener = () => {
  void carregarPalpites().then(() => {
    toast.success('Palpite criado com sucesso!');
  });
};

function tempoDecorrido(timestamp: string): string {
  const agora = new Date();

  let dataPost: Date;

  if (timestamp.includes('+')) {
    const timestampFormatado = timestamp.replace(' ', 'T');
    dataPost = new Date(timestampFormatado);
  } else {
    const timestampLimpo = (timestamp.split('.')[0] + '.' + (timestamp.split('.')[1]?.substring(0, 3) || '000'));
    const timestampFormatado = timestampLimpo.replace(' ', 'T');
    dataPost = new Date(timestampFormatado);
  }
  if (isNaN(dataPost.getTime())) {
    return 'Data inválida';
  }

  const diffMs = agora.getTime() - dataPost.getTime();

  if (diffMs < 0) {
    return 'agora mesmo';
  }

  const diffSeg = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);
  const diffMeses = Math.floor(diffDias / 30);
  const diffAnos = Math.floor(diffMeses / 12);

  if (diffSeg < 60) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHoras < 24) return `há ${diffHoras}h`;
  if (diffDias < 30) return `há ${diffDias}d`;
  if (diffMeses < 12) return `há ${diffMeses} ${diffMeses > 1 ? 'meses' : 'mês'}`;
  return `há ${diffAnos} ${diffAnos > 1 ? 'anos' : 'ano'}`;
}

function addComment() {
  if (!selectedPalpite.value) return;

  const palpite = selectedPalpite.value;
  if (palpite.newComment && palpite.newComment.trim().length > 0) {
    palpite.comments.push({
      user: authStore.user?.nome || 'Você',
      text: palpite.newComment
    });
    palpite.newComment = '';
  }
}

function onImageError(event: Event) {
  console.error('Erro ao carregar imagem:', event);
  const img = event.target as HTMLImageElement;
  console.log('URL da imagem com erro:', img?.src);
}

const topBettors = ref([
  { user: '@RafaGol', precision: '100%' },
  { user: '@MariTips', precision: '90%' },
  { user: '@ZecaBets', precision: '80%' },
]);

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
  await carregarPalpites();
  on('palpite-criado', recarregarPalpitesListener);
});

onBeforeUnmount(() => {
  off('palpite-criado', recarregarPalpitesListener);
});
</script>

<style scoped>
.actions-section {
  padding: 4px 0;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--q-primary) !important;
  transform: scale(1.1);
}

.action-btn .q-icon {
  font-size: 20px;
}

.post-image {
  width: 520px !important;
  height: 220px !important;
  object-fit: cover !important;
  border-radius: 10px;
  margin: 0 auto 8px auto;
  display: block;
}

.image-container {
  display: flex;
  justify-content: center;
  background: #fefefe;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
}

.col-12.col-md-6 {
  min-width: 0;
}

.actions-section {
  display: flex;
  align-items: center;
}

.comments-section {
  min-width: 250px;
  max-width: 300px;
  text-align: left;
}

.comment-input {
  margin-bottom: 4px;
  background: #f9f9f9;
  border-radius: 20px;
  padding: 4px 12px;
}

.comments-list {
  max-height: 170px;
  overflow-y: auto;
  font-size: 0.85em;
  margin-top: 4px;
  width: 100%;
}

.comment-item {
  margin-bottom: 8px;
  color: #000000;
  line-height: 1.4;
  word-wrap: break-word;
  padding: 4px 0;
  border-bottom: 1px solid #e0e0e0;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-user {
  font-weight: 600;
  margin-right: 6px;
  font-size: 0.9em;
  display: inline;
  white-space: normal;
}

.comment-text {
  font-weight: 500;
  font-size: 0.9em;
  display: inline;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
}

/* Garantir que o texto quebre corretamente */
.comment-item {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.q-avatar.rounded-circle img,
.q-avatar.rounded-circle {
  border-radius: 50% !important;
  overflow: hidden;
}

.sidebar-card {
  max-width: 260px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 18px;
  transition: border 0.2s, border-radius 0.2s;
}

@media (max-width: 768px) {
  .row.justify-between.items-start {
    flex-direction: column;
  }

  .comments-section {
    max-width: 100%;
    margin-top: 12px;
  }

  .actions-section {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }

  .comment-item {
    margin-bottom: 6px;
    padding: 3px 0;
  }
}
</style>
