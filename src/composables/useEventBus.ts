import { ref } from 'vue';

type EventCallback = (...args: any[]) => void;
type EventMap = Record<string, EventCallback[]>;

const eventBus = ref<EventMap>({});

export function useEventBus() {
  const emit = (event: string, ...args: any[]): void => {
    if (eventBus.value[event]) {
      eventBus.value[event].forEach(callback => callback(...args));
    }
  };

  const on = (event: string, callback: EventCallback): void => {
    if (!eventBus.value[event]) {
      eventBus.value[event] = [];
    }
    eventBus.value[event].push(callback);
  };

  const off = (event: string, callback: EventCallback): void => {
    if (eventBus.value[event]) {
      eventBus.value[event] = eventBus.value[event].filter(cb => cb !== callback);
    }
  };

  return { emit, on, off };
}
