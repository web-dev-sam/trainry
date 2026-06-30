import { computed, ref } from "vue";
import { tryOnScopeDispose, useIntervalFn, useWakeLock } from "@vueuse/core";
import type { WorkoutPlan } from "@/features/workouts/types";
import { formatClock } from "@/lib/time";

export type TimerColorKind = "countdown" | "run" | "pause" | "done";
export type TimerStatus = "idle" | "running" | "paused" | "done";

type Phase = { kind: "countdown" | "run" | "pause"; seconds: number };

function buildPhases(plan: WorkoutPlan): Phase[] {
  const phases: Phase[] = [];
  if (plan.countdownSeconds > 0) phases.push({ kind: "countdown", seconds: plan.countdownSeconds });
  for (const segment of plan.segments)
    phases.push({ kind: segment.kind, seconds: segment.seconds });
  return phases;
}

/** Fresh per run — drive the colored timer for one workout plan (a snapshot taken at mount). */
export function useWorkoutTimer(plan: WorkoutPlan) {
  const phases = buildPhases(plan);
  const boundaries = phases.reduce<number[]>((acc, phase) => {
    acc.push((acc.at(-1) ?? 0) + phase.seconds * 1000);
    return acc;
  }, []);
  const totalMs = boundaries.at(-1) ?? 0;

  const status = ref<TimerStatus>("idle");
  const elapsedMs = ref(0);

  // Timestamp-anchored so the clock can't drift even if the tick is throttled.
  let anchorMs = 0; // wall-clock when the current running stretch began
  let baseElapsedMs = 0; // elapsed accumulated before the current stretch

  const wakeLock = useWakeLock();

  const currentIndex = computed(() => {
    const elapsed = elapsedMs.value;
    const index = boundaries.findIndex((boundary) => elapsed < boundary);
    return index === -1 ? phases.length : index;
  });

  const currentPhase = computed<Phase | undefined>(() => phases[currentIndex.value]);

  const colorKind = computed<TimerColorKind>(() => {
    if (status.value === "idle") return "countdown";
    if (status.value === "done") return "done";
    return currentPhase.value?.kind ?? "done";
  });

  const remainingSeconds = computed(() => {
    const boundary = boundaries[currentIndex.value];
    if (boundary === undefined) return 0;
    return Math.ceil(Math.max(0, boundary - elapsedMs.value) / 1000);
  });

  const clock = computed(() => formatClock(remainingSeconds.value));
  const progress = computed(() => (totalMs === 0 ? 0 : Math.min(1, elapsedMs.value / totalMs)));

  const segmentTotal = computed(() => plan.segments.length);
  const segmentNumber = computed(() => {
    if (currentPhase.value?.kind === "countdown") return 0;
    const offset = phases.length - plan.segments.length;
    return Math.min(plan.segments.length, currentIndex.value - offset + 1);
  });

  function finish() {
    status.value = "done";
    elapsedMs.value = totalMs;
    intervalPause();
    void wakeLock.release();
  }

  function tick() {
    if (status.value !== "running") return;
    const next = baseElapsedMs + (Date.now() - anchorMs);
    if (next >= totalMs) finish();
    else elapsedMs.value = next;
  }

  const { pause: intervalPause, resume: intervalResume } = useIntervalFn(tick, 100, {
    immediate: false,
  });

  function start() {
    if (phases.length === 0) {
      finish();
      return;
    }
    baseElapsedMs = 0;
    elapsedMs.value = 0;
    anchorMs = Date.now();
    status.value = "running";
    void wakeLock.request("screen");
    intervalResume();
  }

  function pause() {
    if (status.value !== "running") return;
    baseElapsedMs = elapsedMs.value;
    status.value = "paused";
    intervalPause();
    void wakeLock.release();
  }

  function resume() {
    if (status.value !== "paused") return;
    anchorMs = Date.now();
    status.value = "running";
    void wakeLock.request("screen");
    intervalResume();
  }

  function toggle() {
    if (status.value === "running") pause();
    else if (status.value === "paused") resume();
  }

  function skip() {
    const boundary = boundaries[currentIndex.value];
    if (boundary === undefined) {
      finish();
      return;
    }
    baseElapsedMs = boundary;
    anchorMs = Date.now();
    if (boundary >= totalMs) finish();
    else elapsedMs.value = boundary;
  }

  function restart() {
    stop();
    start();
  }

  function stop() {
    status.value = "idle";
    elapsedMs.value = 0;
    baseElapsedMs = 0;
    intervalPause();
    void wakeLock.release();
  }

  tryOnScopeDispose(() => {
    intervalPause();
    void wakeLock.release();
  });

  return {
    status,
    colorKind,
    remainingSeconds,
    clock,
    progress,
    segmentNumber,
    segmentTotal,
    isWakeLockActive: wakeLock.isActive,
    isWakeLockSupported: wakeLock.isSupported,
    start,
    pause,
    resume,
    toggle,
    skip,
    restart,
    stop,
  };
}
