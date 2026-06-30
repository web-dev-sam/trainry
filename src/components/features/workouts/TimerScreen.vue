<script setup lang="ts">
import { computed } from "vue";
import { useNavigation } from "@/composables/useNavigation";
import type { WorkoutPlan } from "@/types/workout";
import { type TimerColorKind, useWorkoutTimer } from "@/composables/useWorkoutTimer";
import { formatClock } from "@/lib/time";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button.vue";
import TimerDigits from "@/components/features/workouts/TimerDigits.vue";

const { plan } = defineProps<{ plan: WorkoutPlan }>();

const { openLibrary } = useNavigation();
const timer = useWorkoutTimer(plan);

const backgrounds: Record<TimerColorKind, string> = {
  countdown: "bg-blue-600",
  run: "bg-green-600",
  pause: "bg-red-600",
  done: "bg-zinc-900",
};

const labels: Record<TimerColorKind, string> = {
  countdown: "Get ready",
  run: "Run",
  pause: "Rest",
  done: "Done",
};

const summary = computed(() => {
  const seconds = plan.segments.reduce((total, segment) => total + segment.seconds, 0);
  return `${plan.segments.length} segments · ${formatClock(seconds)}`;
});

function onCenterTap() {
  if (timer.status.value === "idle") timer.start();
  else timer.toggle();
}

function exit() {
  timer.stop();
  openLibrary();
}
</script>

<template>
  <div
    :class="
      cn(
        'relative flex h-full w-full flex-col text-white transition-colors duration-500',
        backgrounds[timer.colorKind.value],
      )
    "
  >
    <header class="flex items-center justify-between gap-2 p-4">
      <Button
        variant="ghost"
        size="icon"
        class="text-white hover:bg-white/15"
        aria-label="Exit workout"
        @click="exit()"
      >
        ✕
      </Button>
      <p class="min-w-0 flex-1 truncate text-center text-sm font-medium opacity-80">
        {{ plan.name }}
      </p>
      <div class="size-10 shrink-0"></div>
    </header>

    <div class="mx-4 h-1 overflow-hidden rounded-full bg-white/20">
      <div
        class="h-full rounded-full bg-white/80 transition-[width] duration-200 ease-linear"
        :style="{ width: `${timer.progress.value * 100}%` }"
      ></div>
    </div>

    <button
      type="button"
      class="flex flex-1 flex-col items-center justify-center gap-5 px-4 focus:outline-none"
      @click="onCenterTap()"
    >
      <template v-if="timer.status.value === 'idle'">
        <p class="text-xl font-medium uppercase tracking-[0.3em] opacity-80">Ready</p>
        <span class="rounded-2xl bg-white px-12 py-5 text-3xl font-semibold text-blue-700 shadow-lg"
          >Start</span
        >
        <p class="text-sm opacity-70">{{ summary }}</p>
      </template>

      <template v-else-if="timer.status.value === 'done'">
        <p class="font-mono text-[clamp(4rem,24vmin,11rem)] font-semibold leading-none">✓</p>
        <p class="text-2xl font-medium uppercase tracking-[0.3em]">Done</p>
      </template>

      <template v-else>
        <TimerDigits
          :clock="timer.clock.value"
          :label="labels[timer.colorKind.value]"
          :sub="`${timer.segmentNumber.value} / ${timer.segmentTotal.value}`"
        />
        <p
          v-if="timer.status.value === 'paused'"
          class="text-base font-medium uppercase tracking-widest opacity-80"
        >
          Paused — tap to resume
        </p>
      </template>
    </button>

    <footer class="flex items-center justify-center gap-3 p-4">
      <template v-if="timer.status.value === 'done'">
        <Button class="bg-white text-zinc-900 hover:bg-white/90" @click="timer.restart()"
          >Restart</Button
        >
        <Button
          variant="outline"
          class="border-white/40 text-white hover:bg-white/15"
          @click="exit()"
        >
          Back to plans
        </Button>
      </template>
      <template v-else-if="timer.status.value !== 'idle'">
        <Button
          variant="outline"
          class="w-28 border-white/40 text-white hover:bg-white/15"
          @click="timer.toggle()"
        >
          {{ timer.status.value === "paused" ? "Resume" : "Pause" }}
        </Button>
        <Button
          variant="outline"
          class="border-white/40 text-white hover:bg-white/15"
          @click="timer.skip()"
        >
          Skip
        </Button>
      </template>
    </footer>
  </div>
</template>
