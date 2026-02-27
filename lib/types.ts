// ─────────────────────────────────────────────────────────
//  Shared TypeScript types for UNHEVAL/CEPREVAL Prep App
// ─────────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Unit {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Topic {
  id: string;
  unit_id: string;
  name: string;
  slug: string;
  order: number;
}

export interface ExplanationJson {
  text: string;
  error_comun?: string;
  verificacion?: string;
}

export interface Question {
  id: string;
  course_id: string;
  unit_id: string;
  topic_id: string;
  prompt_text: string;
  options_json: Record<"A" | "B" | "C" | "D" | "E", string>;
  correct_option: "A" | "B" | "C" | "D" | "E";
  explanation_json: ExplanationJson;
  difficulty: "easy" | "medium" | "hard";
  source_type: string;
  source_ref: string | null;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | "E";
  is_correct: boolean;
  time_ms: number;
  created_at: string;
}

export interface Mastery {
  user_id: string;
  topic_id: string;
  mastery_score: number;
  updated_at: string;
}

// Enriched types for UI
export interface UnitWithTopics extends Unit {
  topics: TopicWithMastery[];
}

export interface CourseWithUnits extends Course {
  units: UnitWithTopics[];
}

export interface TopicWithMastery extends Topic {
  mastery_score?: number;
}

export interface TopicStats {
  topic_id: string;
  topic_name: string;
  total: number;
  correct: number;
  accuracy: number;
  avg_time_ms: number;
  mastery_score: number;
}

export interface CourseReport {
  course: Course;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  avg_time_ms: number;
  topic_stats: TopicStats[];
}

export type OptionKey = "A" | "B" | "C" | "D" | "E";

export interface PracticeState {
  question: Question;
  selected: OptionKey | null;
  revealed: boolean;
  start_time: number;
}
