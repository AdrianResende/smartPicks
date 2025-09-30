import { defineBoot } from '#q-app/wrappers';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const toastOptions: ToastContainerOptions = {
  autoClose: 3000,
  position: 'top-right',
  pauseOnHover: true,
  hideProgressBar: false,
  theme: 'light',
};

export default defineBoot(({ app }) => {
  app.use(Vue3Toastify, toastOptions);
});
