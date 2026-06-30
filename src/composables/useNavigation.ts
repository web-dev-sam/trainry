import { ref } from "vue";

type Screen = "library" | "editor" | "run";

// Module scope → one navigation state for the whole app.
const screen = ref<Screen>("library");
const activePlanId = ref<string>();

export function useNavigation() {
  function openLibrary() {
    screen.value = "library";
  }

  function editPlan(planId: string) {
    activePlanId.value = planId;
    screen.value = "editor";
  }

  function runPlan(planId: string) {
    activePlanId.value = planId;
    screen.value = "run";
  }

  return { screen, activePlanId, openLibrary, editPlan, runPlan };
}
