<script setup lang="ts">
import { ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark();
const toggleDark = useToggle(isDark);

const count = ref(0);
</script>

<template>
  <main
    class="grid min-h-svh place-items-center bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"
  >
    <div class="flex flex-col items-center gap-6 text-center">
      <h1 class="text-4xl font-semibold tracking-tight">trainry</h1>
      <p class="text-gray-500 dark:text-gray-400">Vue 3.5 · VueUse · Tailwind · TypeScript</p>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-500"
          @click="count++"
        >
          count is {{ count }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-4 py-2 font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          @click="toggleDark()"
        >
          {{ isDark ? "light" : "dark" }}
        </button>
      </div>
    </div>
  </main>
</template>
