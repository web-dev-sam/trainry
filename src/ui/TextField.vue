<script setup lang="ts">
import { cn } from "@/lib/cn";

const { class: className } = defineProps<{ class?: string }>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <input
    v-model="model"
    type="text"
    :class="
      cn(
        'h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )
    "
  />
</template>
