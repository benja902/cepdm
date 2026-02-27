// ─────────────────────────────────────────────────────────────
//  Quality Gate — validates explanation completeness
// ─────────────────────────────────────────────────────────────

export interface QualityResult {
  valid: boolean;
  issues: string[];
  needsReview: boolean;
}

export interface ExplanationBlock {
  type: "text" | "math";
  content?: string; // for text blocks
  latex?: string;   // for math blocks
}

export interface ExplanationJsonV2 {
  blocks?: ExplanationBlock[];
  error_common?: string;
  verification?: string;
  // backward compat (Fase 1 format)
  text?: string;
  error_comun?: string;
  verificacion?: string;
}

export function validateExplanation(
  explanationJson: ExplanationJsonV2 | null | undefined,
  courseSlug: string,
  errorCommon?: string | null,
  verification?: string | null
): QualityResult {
  const issues: string[] = [];

  if (!explanationJson || (!explanationJson.blocks?.length && !explanationJson.text)) {
    return {
      valid: false,
      issues: ["Sin explicación cargada"],
      needsReview: true,
    };
  }

  const blocks = explanationJson.blocks ?? [];
  const textBlocks = blocks.filter((b) => b.type === "text" && b.content?.trim());
  const mathBlocks = blocks.filter((b) => b.type === "math" && b.latex?.trim());

  // Old format: single text block counts as 1
  const effectiveTextCount = blocks.length > 0 ? textBlocks.length : explanationJson.text ? 1 : 0;

  if (effectiveTextCount < 2 && blocks.length > 0) {
    issues.push("Se requieren mínimo 2 bloques de texto");
  }

  if (courseSlug === "algebra" && blocks.length > 0 && mathBlocks.length < 1) {
    issues.push("Preguntas de Álgebra deben incluir al menos 1 bloque math");
  }

  // Check error_common from question column OR from explanation_json
  const hasErrorCommon =
    errorCommon?.trim() ||
    explanationJson.error_common?.trim() ||
    explanationJson.error_comun?.trim();

  if (!hasErrorCommon) {
    issues.push("Falta campo 'Error común'");
  }

  // Check verification
  const hasVerification =
    verification?.trim() ||
    explanationJson.verification?.trim() ||
    explanationJson.verificacion?.trim();

  if (!hasVerification) {
    issues.push("Falta campo 'Verificación'");
  }

  return {
    valid: issues.length === 0,
    issues,
    needsReview: issues.length > 0,
  };
}

// Format a block list for display — resolves old format transparently
export function getBlocks(
  explanationJson: ExplanationJsonV2 | null | undefined
): ExplanationBlock[] {
  if (!explanationJson) return [];
  if (explanationJson.blocks?.length) return explanationJson.blocks;
  // backward compat: wrap old text field in a single text block
  if (explanationJson.text) {
    return [{ type: "text", content: explanationJson.text }];
  }
  return [];
}
