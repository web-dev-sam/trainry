<script setup lang="ts">
import { cn } from "@/lib/cn";
import Button from "@/ui/Button.vue";

const {
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  class: className,
} = defineProps<{
  min?: number;
  max?: number;
  step?: number;
  class?: string;
}>();

const model = defineModel<number>({ required: true });

function clamp(value: number): number {
  return Math.min(max, Math.max(min, value));
}

function stepBy(delta: number) {
  model.value = clamp(model.value + delta);
}

function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value);
  model.value = clamp(Number.isFinite(raw) ? raw : min);
}
</script>

<template>
  <div :class="cn('inline-flex items-center gap-1.5', className)">
    <Button
      variant="outline"
      size="icon"
      aria-label="Decrease"
      :disabled="model <= min"
      @click="stepBy(-step)"
    >
      −
    </Button>
    <input
      :value="model"
      type="number"
      inputmode="numeric"
      :min="min"
      :max="max"
      :step="step"
      class="h-10 w-16 rounded-lg border border-input bg-transparent text-center font-mono text-base tabular-nums text-foreground [appearance:textfield] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      @input="onInput($event)"
      @change="onInput($event)"
    />
    <Button
      variant="outline"
      size="icon"
      aria-label="Increase"
      :disabled="model >= max"
      @click="stepBy(step)"
    >
      +
    </Button>
  </div>
</template>
