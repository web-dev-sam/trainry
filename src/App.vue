<script setup lang="ts">
import { computed } from "vue";
import { useShell } from "@/composables/useShell";
import { useWorkoutLibrary } from "@/features/workouts/composables/useWorkoutLibrary";
import WorkoutLibrary from "@/features/workouts/WorkoutLibrary.vue";
import PlanEditor from "@/features/workouts/PlanEditor.vue";
import TimerScreen from "@/features/workouts/TimerScreen.vue";

const { screen, activePlanId } = useShell();
const { getPlan } = useWorkoutLibrary();

const activePlan = computed(() => (activePlanId.value ? getPlan(activePlanId.value) : undefined));
</script>

<template>
  <div class="h-full w-full overflow-hidden bg-background text-foreground">
    <PlanEditor v-if="screen === 'editor' && activePlan" :plan="activePlan" />
    <TimerScreen
      v-else-if="screen === 'run' && activePlan"
      :key="activePlan.id"
      :plan="activePlan"
    />
    <WorkoutLibrary v-else />

    <!-- Landscape-first: nudge phones held upright. -->
    <div
      class="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-background/95 p-8 text-center portrait:max-md:flex"
    >
      <p class="text-5xl">↻</p>
      <p class="text-lg font-medium">Rotate your device</p>
      <p class="text-sm text-muted-foreground">trainry works best in landscape.</p>
    </div>
  </div>
</template>
