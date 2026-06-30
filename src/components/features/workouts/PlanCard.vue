<script setup lang="ts">
import { computed } from "vue";
import type { WorkoutPlan } from "@/types/workout";
import { formatClock } from "@/lib/time";
import Card from "@/components/ui/Card.vue";
import Button from "@/components/ui/Button.vue";

const { plan } = defineProps<{ plan: WorkoutPlan }>();

const emit = defineEmits<{
  (e: "start"): void;
  (e: "edit"): void;
  (e: "duplicate"): void;
  (e: "remove"): void;
}>();

const runCount = computed(() => plan.segments.filter((segment) => segment.kind === "run").length);
const restCount = computed(
  () => plan.segments.filter((segment) => segment.kind === "pause").length,
);
const totalSeconds = computed(() =>
  plan.segments.reduce((total, segment) => total + segment.seconds, 0),
);
</script>

<template>
  <Card class="flex flex-col gap-4 p-4">
    <div class="min-w-0">
      <h2 class="truncate text-lg font-semibold">{{ plan.name }}</h2>
      <p class="mt-1 text-sm text-muted-foreground tabular-nums">
        {{ runCount }} runs · {{ restCount }} rests · {{ formatClock(totalSeconds) }}
      </p>
    </div>

    <div class="mt-auto flex items-center gap-2">
      <Button class="flex-1" :disabled="plan.segments.length === 0" @click="emit('start')"
        >▶ Start</Button
      >
      <Button variant="outline" size="icon" aria-label="Edit plan" @click="emit('edit')">✎</Button>
      <Button variant="ghost" size="icon" aria-label="Duplicate plan" @click="emit('duplicate')"
        >⧉</Button
      >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete plan"
        class="text-red-400 hover:bg-red-950 hover:text-red-300"
        @click="emit('remove')"
      >
        🗑
      </Button>
    </div>
  </Card>
</template>
