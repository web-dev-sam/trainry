<script setup lang="ts">
import { useShell } from "@/composables/useShell";
import { useWorkoutLibrary } from "@/features/workouts/composables/useWorkoutLibrary";
import Button from "@/ui/Button.vue";
import PlanCard from "@/features/workouts/PlanCard.vue";

const { editPlan, runPlan } = useShell();
const library = useWorkoutLibrary();

function createPlan() {
  const plan = library.addPlan();
  editPlan(plan.id);
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex items-center justify-between gap-3 border-b border-border p-4">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">trainry</h1>
        <p class="text-sm text-muted-foreground">Interval timer</p>
      </div>
      <Button @click="createPlan()">+ New plan</Button>
    </header>

    <main class="flex-1 overflow-y-auto p-4">
      <p
        v-if="library.plans.value.length === 0"
        class="py-16 text-center text-sm text-muted-foreground"
      >
        No plans yet. Create one to get started.
      </p>

      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PlanCard
          v-for="plan in library.plans.value"
          :key="plan.id"
          :plan="plan"
          @start="runPlan(plan.id)"
          @edit="editPlan(plan.id)"
          @duplicate="library.duplicatePlan(plan.id)"
          @remove="library.deletePlan(plan.id)"
        />
      </div>
    </main>
  </div>
</template>
