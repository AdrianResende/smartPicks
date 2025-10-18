<template>
  <q-page class="q-pa-md flex full-height full-width text-white" style="background-color: #B9EAEF;">
    <div class="row justify-center full-width" style="max-width: 1200px; width: 100%;">
      <div class="col-12 col-md-3 q-pr-md q-mb-md">
        <q-card class="q-pa-md text-center shadow-2 bg-white text-dark sidebar-card">
          <div class="text-h6 text-weight-bold q-mb-sm">Seu Perfil</div>
          <q-avatar size="72px" class="q-mb-sm rounded-circle overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=3" alt="Perfil" />
          </q-avatar>
          <div class="text-body1 q-mb-xs">Adrian Resende</div>
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
        <q-card v-for="post in posts" :key="post.id"
          class="q-pa-md q-mb-md shadow-2 rounded-xl hover-border bg-white text-dark">
          <div class="row items-center no-wrap q-mb-sm">
            <q-avatar size="45px" class="q-mr-sm rounded-circle overflow-hidden">
              <img :src="post.avatar" />
            </q-avatar>
            <div>
              <div class="text-weight-medium">{{ post.user }}</div>
              <div class="text-grey-7 text-caption">{{ post.time }}</div>
            </div>
          </div>

          <div class="text-body1 q-mb-sm">
            {{ post.text }}
          </div>

          <q-card class="image-container col-6">
            <q-img :src="post.image" class="rounded-borders post-image" spinner-color="primary"
              style="width: 100%; height: auto; max-height: 500px; object-fit: contain;" />
            <div class="comments-section col-4 q-ml-md">
              <q-input dense v-model="post.newComment" placeholder="Comente aqui..." class="comment-input q-mb-xs"
                @keyup.enter="addComment(post)" borderless :input-style="{ fontSize: '0.95em' }">
                <template v-slot:append>
                  <q-btn flat dense icon="send" class="text-primary" size="12px" @click="addComment(post)" />
                </template>
              </q-input>
              <div v-if="post.comments && post.comments.length"
                class="comments-list q-ml-sm q-mt-sm q-pa-sm bg-grey-1 rounded-borders">
                <div v-for="(comment, idx) in post.comments" :key="idx" class="comment-item">
                  <span class="comment-user">{{ comment.user }}:</span>
                  <span class="comment-text">{{ comment.text }}</span>
                </div>
              </div>
            </div>
          </q-card>

          <div class="row justify-between items-start q-pt-sm q-ml-sm">
            <div class="actions-section">
              <q-btn flat size="12px" round dense icon="thumb_up" class="q-mr-sm text-primary">
                <q-tooltip anchor="center right" self="center left">Curtir</q-tooltip>
              </q-btn>
              <q-btn round size="12px" flat dense icon="thumb_down" class="q-mr-sm text-primary">
                <q-tooltip anchor="center right" self="center left">Não Curtir</q-tooltip>
              </q-btn>
              <q-btn round size="12px" flat class="text-primary" dense icon="share">
                <q-tooltip anchor="center right" self="center left">Compartilhar</q-tooltip>
              </q-btn>
              <q-btn round size="12px" flat class="text-primary" dense icon="attach_file">
                <q-tooltip anchor="center right" self="center left">Copiar Bet</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    try {
      const isValid = await authStore.validateToken();
      if (!isValid) {
        toast.error('Sessão expirada. Faça login novamente.');
        await router.push('/');
      }
    } catch {
      toast.error('Erro ao validar sessão. Faça login novamente.');
      await router.push('/');
    }
  }
});

const posts = ref([
  {
    id: 1,
    user: 'RafaGol',
    avatar: 'https://i.pravatar.cc/150?img=12',
    time: 'há 2h',
    text: 'Ganhando todas no campeonato! 💪⚽',
    image: 'https://picsum.photos/600/400?random=1',
    comments: [
      { user: 'MariTips', text: 'Parabéns!' },
      { user: 'ZecaBets', text: 'Mandou bem!' }
    ],
    newComment: ''
  },
  {
    id: 2,
    user: 'MariTips',
    avatar: 'https://i.pravatar.cc/150?img=5',
    time: 'há 4h',
    text: 'Hoje é dia de apostar no Flamengo 🔥',
    image: 'https://picsum.photos/600/400?random=2',
    comments: [],
    newComment: ''
  },
]);

interface Comment {
  user: string;
  text: string;
}

interface Post {
  id: number;
  user: string;
  avatar: string;
  time: string;
  text: string;
  image: string;
  comments: Comment[];
  newComment: string;
}

function addComment(post: Post) {
  if (post.newComment && post.newComment.trim().length > 0) {
    post.comments.push({ user: 'Você', text: post.newComment });
    post.newComment = '';
  }
}

const topBettors = ref([
  { user: '@RafaGol', precision: '100%' },
  { user: '@MariTips', precision: '90%' },
  { user: '@ZecaBets', precision: '80%' },
]);

</script>

<style scoped>
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
  max-height: 140px;
  overflow-y: auto;
  font-size: 0.85em;
  margin-top: 4px;
}

.comment-item {
  margin-bottom: 3px;
  color: #000000;
  line-height: 1.3;
}

.comment-user {
  font-weight: 600;
  margin-right: 4px;
  font-size: 0.9em;
}

.comment-text {
  font-weight: 400;
  font-size: 0.9em;
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
}
</style>
