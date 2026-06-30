<script setup lang="ts">
const { clock, label, sub } = defineProps<{
  clock: string;
  label: string;
  sub?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <p class="text-xl font-medium uppercase tracking-[0.3em] opacity-80 sm:text-2xl">{{ label }}</p>
    <p class="font-mono text-[clamp(5rem,33vmin,15rem)] font-semibold leading-none tabular-nums">
      {{ clock }}
    </p>
    <p v-if="sub" class="font-mono text-lg tabular-nums opacity-70 sm:text-xl">{{ sub }}</p>
  </div>
</template>
