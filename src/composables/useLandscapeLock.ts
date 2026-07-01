import { onBeforeUnmount, onMounted } from "vue";
import { useScreenOrientation } from "@vueuse/core";

// Android honours a runtime orientation lock only in standalone/fullscreen
// contexts. A plain browser tab rejects it (NotSupportedError) — we swallow
// that, since the CSS "rotate your device" hint covers the un-lockable case.
export function useLandscapeLock() {
  const { isSupported, lockOrientation, unlockOrientation } = useScreenOrientation();

  onMounted(async () => {
    if (!isSupported.value) return;
    try {
      await lockOrientation("landscape");
    } catch {
      // Not standalone/fullscreen — the lock request is expected to fail here.
    }
  });

  onBeforeUnmount(() => {
    if (isSupported.value) unlockOrientation();
  });
}
