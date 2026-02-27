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

// ── Explanation formats ──────────────────────────────────

export interface ExplanationBlock {
  type: "text" | "math";
  content?: string; // text blocks
  latex?: string;   // math blocks
}

export interface ExplanationJson {
  // Fase 2 format
  blocks?: ExplanationBlock[];
  error_common?: string;
  verification?: string;
  // Fase 1 backward-compat
  text?: string;
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
  explanation_json: ExplanationJson | null;
  difficulty: "easy" | "medium" | "hard";
  source_type: string;
  source_ref: string | null;
  // Fase 2 columns
  error_common: string | null;
  verification: string | null;
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

// ── Fase 2: Tutor Engine ─────────────────────────────────

export interface LearningKitSummary {
  bullets: string[];
  notes?: string[];
}

export interface LearningKitMethod {
  name: string;
  steps: string[];
  when_to_use?: string;
}

export interface LearningKitMethods {
  methods: LearningKitMethod[];
}

export interface LearningKitMistake {
  mistake: string;
  fix: string;
}

export interface LearningKitMistakes {
  mistakes: LearningKitMistake[];
}

export interface LearningKitVerification {
  checks: string[];
}

export interface LearningKit {
  id: string;
  topic_id: string;
  summary_json: LearningKitSummary;
  methods_json: LearningKitMethods;
  common_mistakes_json: LearningKitMistakes;
  verification_json: LearningKitVerification;
  created_at: string;
}

export interface SolutionTemplateMinReqs {
  min_text_blocks: number;
  requires_math: boolean;
  requires_error_common: boolean;
  requires_verification: boolean;
}

export interface SolutionTemplate {
  id: string;
  course_id: string;
  name: string;
  slug: string;
  schema_json: { steps: string[] };
  min_requirements_json: SolutionTemplateMinReqs;
  created_at: string;
}

export interface QuestionSolutionMeta {
  question_id: string;
  template_id: string | null;
  skill_tags: string[];
  trap_tags: string[];
  difficulty: number | null;
  updated_at: string;
}

// ── Enriched types for UI ────────────────────────────────

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
