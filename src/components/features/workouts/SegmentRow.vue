<script setup lang="ts">
import type { SegmentKind, WorkoutSegment } from "@/types/workout";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button.vue";
import NumberStepper from "@/components/ui/NumberStepper.vue";

const {
  segment,
  index,
  isFirst = false,
  isLast = false,
} = defineProps<{
  segment: WorkoutSegment;
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
}>();

const emit = defineEmits<{
  (e: "changeKind", kind: SegmentKind): void;
  (e: "changeSeconds", seconds: number): void;
  (e: "move", direction: -1 | 1): void;
  (e: "remove"): void;
}>();

const kinds: { value: SegmentKind; label: string; active: string }[] = [
  { value: "run", label: "Run", active: "bg-green-600 text-white" },
  { value: "pause", label: "Rest", active: "bg-red-600 text-white" },
];
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 pl-3">
    <span class="w-5 shrink-0 text-center font-mono text-sm text-muted-foreground tabular-nums">{{
      index + 1
    }}</span>

    <div class="inline-flex shrink-0 rounded-lg border border-border p-0.5">
      <button
        v-for="kind in kinds"
        :key="kind.value"
        type="button"
        :aria-pressed="segment.kind === kind.value"
        :class="
          cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            segment.kind === kind.value
              ? kind.active
              : 'text-muted-foreground hover:text-foreground',
          )
        "
        @click="emit('changeKind', kind.value)"
      >
        {{ kind.label }}
      </button>
    </div>

    <div class="flex shrink-0 items-center gap-1.5">
      <NumberStepper
        :model-value="segment.seconds"
        :min="5"
        :max="3600"
        :step="5"
        @update:model-value="emit('changeSeconds', $event)"
      />
      <span class="text-sm text-muted-foreground">sec</span>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Move up"
        :disabled="isFirst"
        @click="emit('move', -1)"
      >
        ↑
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Move down"
        :disabled="isLast"
        @click="emit('move', 1)"
      >
        ↓
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove segment"
        class="text-red-400 hover:bg-red-950 hover:text-red-300"
        @click="emit('remove')"
      >
        ✕
      </Button>
    </div>
  </div>
</template>
