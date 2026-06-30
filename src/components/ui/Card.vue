<script setup lang="ts">
import { cn } from "@/lib/cn";

const { class: className } = defineProps<{ class?: string }>();
</script>

<template>
  <div :class="cn('rounded-xl border border-border bg-card text-foreground', className)">
    <slot />
  </div>
</template>
