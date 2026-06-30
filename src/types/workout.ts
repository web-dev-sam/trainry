/** Domain model for the workout library — the shape persisted to localStorage. */

export type SegmentKind = "run" | "pause";

export type WorkoutSegment = {
  id: string;
  kind: SegmentKind;
  seconds: number;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  /** Blue "get ready" lead-in before the first segment. 0 disables it. */
  countdownSeconds: number;
  segments: WorkoutSegment[];
};
