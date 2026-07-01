<script setup lang="ts">
import { computed } from "vue";
import { useNavigation } from "@/composables/useNavigation";
import { useLandscapeLock } from "@/composables/useLandscapeLock";
import { useWorkoutLibrary } from "@/composables/useWorkoutLibrary";
import WorkoutLibrary from "@/components/features/workouts/WorkoutLibrary.vue";
import PlanEditor from "@/components/features/workouts/PlanEditor.vue";
import TimerScreen from "@/components/features/workouts/TimerScreen.vue";

const { screen, activePlanId } = useNavigation();
const { getPlan } = useWorkoutLibrary();

useLandscapeLock();

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
