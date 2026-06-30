<script setup lang="ts">
import { computed } from "vue";
import { useNavigation } from "@/composables/useNavigation";
import type { WorkoutPlan } from "@/types/workout";
import { useWorkoutLibrary } from "@/composables/useWorkoutLibrary";
import { formatClock } from "@/lib/time";
import Button from "@/components/ui/Button.vue";
import TextField from "@/components/ui/TextField.vue";
import NumberStepper from "@/components/ui/NumberStepper.vue";
import SegmentRow from "@/components/features/workouts/SegmentRow.vue";

const { plan } = defineProps<{ plan: WorkoutPlan }>();

const { openLibrary, runPlan } = useNavigation();
const library = useWorkoutLibrary();

const totalSeconds = computed(
  () =>
    plan.countdownSeconds + plan.segments.reduce((total, segment) => total + segment.seconds, 0),
);
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex flex-wrap items-center gap-3 border-b border-border p-3">
      <Button variant="ghost" size="icon" aria-label="Back to plans" @click="openLibrary()"
        >←</Button
      >

      <TextField
        :model-value="plan.name"
        class="h-10 min-w-40 flex-1 text-base font-medium"
        @update:model-value="library.renamePlan(plan.id, $event)"
      />

      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        Lead-in
        <NumberStepper
          :model-value="plan.countdownSeconds"
          :min="0"
          :max="60"
          :step="1"
          @update:model-value="library.setCountdown(plan.id, $event)"
        />
      </label>

      <Button size="lg" :disabled="plan.segments.length === 0" @click="runPlan(plan.id)"
        >▶ Start</Button
      >
    </header>

    <main class="flex-1 space-y-2 overflow-y-auto p-3">
      <p v-if="plan.segments.length === 0" class="py-10 text-center text-sm text-muted-foreground">
        No segments yet — add a run or rest below.
      </p>

      <SegmentRow
        v-for="(segment, index) in plan.segments"
        :key="segment.id"
        :segment="segment"
        :index="index"
        :is-first="index === 0"
        :is-last="index === plan.segments.length - 1"
        @change-kind="library.setSegmentKind(plan.id, segment.id, $event)"
        @change-seconds="library.setSegmentSeconds(plan.id, segment.id, $event)"
        @move="library.moveSegment(plan.id, segment.id, $event)"
        @remove="library.removeSegment(plan.id, segment.id)"
      />

      <div class="flex gap-2 pt-1">
        <Button variant="secondary" @click="library.addSegment(plan.id, 'run')">+ Add run</Button>
        <Button variant="secondary" @click="library.addSegment(plan.id, 'pause')"
          >+ Add rest</Button
        >
      </div>
    </main>

    <footer class="border-t border-border px-3 py-2 text-center text-sm text-muted-foreground">
      {{ plan.segments.length }} segments · {{ formatClock(totalSeconds) }} total
    </footer>
  </div>
</template>
