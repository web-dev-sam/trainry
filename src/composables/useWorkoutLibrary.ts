import { useStorage } from "@vueuse/core";
import type { SegmentKind, WorkoutPlan, WorkoutSegment } from "@/types/workout";

const STORAGE_KEY = "trainry.plans.v1";

const DEFAULT_SECONDS: Record<SegmentKind, number> = { run: 60, pause: 30 };

function createId(): string {
  return crypto.randomUUID();
}

function createSegment(kind: SegmentKind): WorkoutSegment {
  return { id: createId(), kind, seconds: DEFAULT_SECONDS[kind] };
}

function createPlan(name: string): WorkoutPlan {
  return {
    id: createId(),
    name,
    countdownSeconds: 5,
    segments: [createSegment("run"), createSegment("pause")],
  };
}

/** The example plan from the brief: 3 × (60s run, 30s pause). */
function createStarterPlan(): WorkoutPlan {
  return {
    id: createId(),
    name: "Intervals 3 × 60/30",
    countdownSeconds: 5,
    segments: Array.from({ length: 3 }, () => [
      createSegment("run"),
      createSegment("pause"),
    ]).flat(),
  };
}

// Module scope → one library shared across the app, persisted to localStorage.
const plans = useStorage<WorkoutPlan[]>(STORAGE_KEY, [createStarterPlan()]);

export function useWorkoutLibrary() {
  function getPlan(id: string): WorkoutPlan | undefined {
    return plans.value.find((plan) => plan.id === id);
  }

  function updatePlan(id: string, updater: (plan: WorkoutPlan) => WorkoutPlan) {
    plans.value = plans.value.map((plan) => (plan.id === id ? updater(plan) : plan));
  }

  function addPlan(name = "New plan"): WorkoutPlan {
    const plan = createPlan(name);
    plans.value = [...plans.value, plan];
    return plan;
  }

  function duplicatePlan(id: string): WorkoutPlan | undefined {
    const source = getPlan(id);
    if (!source) return undefined;
    const copy: WorkoutPlan = {
      ...source,
      id: createId(),
      name: `${source.name} copy`,
      segments: source.segments.map((segment) => ({ ...segment, id: createId() })),
    };
    plans.value = [...plans.value, copy];
    return copy;
  }

  function deletePlan(id: string) {
    plans.value = plans.value.filter((plan) => plan.id !== id);
  }

  function renamePlan(id: string, name: string) {
    updatePlan(id, (plan) => ({ ...plan, name }));
  }

  function setCountdown(id: string, countdownSeconds: number) {
    updatePlan(id, (plan) => ({ ...plan, countdownSeconds }));
  }

  function addSegment(id: string, kind: SegmentKind) {
    updatePlan(id, (plan) => ({ ...plan, segments: [...plan.segments, createSegment(kind)] }));
  }

  function removeSegment(id: string, segmentId: string) {
    updatePlan(id, (plan) => ({
      ...plan,
      segments: plan.segments.filter((segment) => segment.id !== segmentId),
    }));
  }

  function setSegmentSeconds(id: string, segmentId: string, seconds: number) {
    updatePlan(id, (plan) => ({
      ...plan,
      segments: plan.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, seconds } : segment,
      ),
    }));
  }

  function setSegmentKind(id: string, segmentId: string, kind: SegmentKind) {
    updatePlan(id, (plan) => ({
      ...plan,
      segments: plan.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, kind } : segment,
      ),
    }));
  }

  function moveSegment(id: string, segmentId: string, direction: -1 | 1) {
    updatePlan(id, (plan) => {
      const index = plan.segments.findIndex((segment) => segment.id === segmentId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= plan.segments.length) return plan;
      const segments = plan.segments.slice();
      [segments[index], segments[target]] = [segments[target], segments[index]];
      return { ...plan, segments };
    });
  }

  return {
    plans,
    getPlan,
    addPlan,
    duplicatePlan,
    deletePlan,
    renamePlan,
    setCountdown,
    addSegment,
    removeSegment,
    setSegmentSeconds,
    setSegmentKind,
    moveSegment,
  };
}
