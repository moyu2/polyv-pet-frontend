import { ref, onMounted, onUnmounted, computed, Ref } from 'vue';

// 手动声明 NetworkInformation 接口
interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export function useNetworkStatus() {
  const effectiveType: Ref<string> = ref('unknown');
  const downlink: Ref<number | null> = ref(null);
  const rtt: Ref<number | null> = ref(null);
  const isOnline: Ref<boolean> = ref(navigator.onLine);

  const updateNetworkStatus = () => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      effectiveType.value = connection.effectiveType || 'unknown';
      downlink.value = connection.downlink || null;
      rtt.value = connection.rtt || null;
    }
    isOnline.value = navigator.onLine;
  };

  const handleOnline = () => {
    isOnline.value = true;
    updateNetworkStatus();
  };

  const handleOffline = () => {
    isOnline.value = false;
    updateNetworkStatus();
  };

  onMounted(() => {
    updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.removeEventListener('change', updateNetworkStatus);
    }
  });

  const isWeakNetwork = computed(() => {
    return effectiveType.value === '2g' || effectiveType.value === '3g';
  });

  return {
    effectiveType,
    downlink,
    rtt,
    isOnline,
    isWeakNetwork,
  };
}
