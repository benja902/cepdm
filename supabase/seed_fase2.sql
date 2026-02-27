-- ================================================================
--  SEED FASE 2 — Kits didácticos, plantillas y meta de preguntas
--  Run AFTER schema_fase2.sql
--  Execute in: Supabase Dashboard → SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────
--  SOLUTION TEMPLATES  (3 plantillas iniciales)
-- ────────────────────────────────────────────────────────────
insert into solution_templates (id, course_id, name, slug, schema_json, min_requirements_json) values
(
  'aaaa0001-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Plantilla Ecuación Lineal',
  'algebra-ecuacion-lineal',
  '{"steps":[
    "Identificar incógnita y términos",
    "Despejar la incógnita (pasar términos al lado opuesto)",
    "Simplificar y calcular valor numérico",
    "Verificar sustituyendo en la ecuación original"
  ]}',
  '{"min_text_blocks":2,"requires_math":true,"requires_error_common":true,"requires_verification":true}'
),
(
  'aaaa0002-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Plantilla Factorización / Productos Notables',
  'algebra-factorizacion',
  '{"steps":[
    "Identificar la forma del polinomio (binomio, trinomio, etc.)",
    "Reconocer el producto notable o tipo de factorización aplicable",
    "Aplicar la identidad correspondiente",
    "Expandir el resultado para verificar"
  ]}',
  '{"min_text_blocks":2,"requires_math":true,"requires_error_common":true,"requires_verification":true}'
),
(
  'aaaa0003-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000002',
  'Plantilla Comprensión Lectora (idea principal / inferencia)',
  'verbal-comprension',
  '{"steps":[
    "Leer el texto identificando topic y comentario de cada párrafo",
    "Determinar la idea principal (eje central del texto)",
    "Eliminar opciones que son detalles o ideas secundarias",
    "Confirmar la opción que resume todo el texto"
  ]}',
  '{"min_text_blocks":2,"requires_math":false,"requires_error_common":true,"requires_verification":true}'
),
(
  'aaaa0004-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000003',
  'Plantilla Grammar Rule (rule → example → exception)',
  'ingles-grammar-rule',
  '{"steps":[
    "Identificar el punto gramatical evaluado (tiempo, verbo, estructura)",
    "Recordar la regla base aplicable",
    "Aplicar la regla al contexto de la oración",
    "Verificar con una excepción conocida si aplica"
  ]}',
  '{"min_text_blocks":2,"requires_math":false,"requires_error_common":true,"requires_verification":true}'
)
on conflict (slug) do nothing;

-- ────────────────────────────────────────────────────────────
--  LEARNING KITS  (usando subqueries por slug de topic/unit)
-- ────────────────────────────────────────────────────────────

-- KIT 1: Álgebra — Binomio al cuadrado
insert into learning_kits (topic_id, summary_json, methods_json, common_mistakes_json, verification_json)
select
  t.id,
  '{
    "bullets": [
      "(a + b)² = a² + 2ab + b²",
      "(a - b)² = a² - 2ab + b²",
      "El término central siempre es el DOBLE del producto de los términos",
      "El resultado siempre tiene 3 términos (trinomio cuadrado perfecto)"
    ],
    "notes": [
      "No confundir con la diferencia de cuadrados que tiene solo 2 términos"
    ]
  }'::jsonb,
  '{
    "methods": [
      {
        "name": "Método directo por identidad",
        "steps": [
          "Identificar a (primer término) y b (segundo término)",
          "Calcular a²",
          "Calcular b²",
          "Calcular el término medio: 2·a·b (con el signo del binomio)",
          "Escribir el trinomio: a² ± 2ab + b²"
        ],
        "when_to_use": "Siempre que el polinomio sea un binomio elevado al cuadrado"
      }
    ]
  }'::jsonb,
  '{
    "mistakes": [
      {"mistake": "Elevar cada término al cuadrado sin el término medio: (a+b)² = a² + b²", "fix": "Siempre incluir el término medio 2ab"},
      {"mistake": "Olvidar el signo: (a-b)² = a² + 2ab + b² (positivo)", "fix": "El último término de (a-b)² es +b² porque (-b)² = b²"}
    ]
  }'::jsonb,
  '{
    "checks": [
      "Expandir el resultado y verificar que sea igual al cuadrado original",
      "Contar: el resultado SIEMPRE tiene exactamente 3 términos",
      "El último término siempre es positivo (cuadrado perfecto)"
    ]
  }'::jsonb
from topics t
join units u on t.unit_id = u.id
where t.slug = 'binomio-al-cuadrado'
  and u.id = 'a1000004-0000-0000-0000-000000000001'
on conflict (topic_id) do nothing;

-- KIT 2: Álgebra — Diferencia de cuadrados
insert into learning_kits (topic_id, summary_json, methods_json, common_mistakes_json, verification_json)
select
  t.id,
  '{
    "bullets": [
      "a² - b² = (a + b)(a - b)",
      "Solo aplica cuando AMBOS términos son cuadrados perfectos",
      "El resultado son siempre DOS factores conjugados",
      "No existe una suma de cuadrados en la factorización real"
    ],
    "notes": [
      "a² + b² NO factoriza en los reales (error muy común)"
    ]
  }'::jsonb,
  '{
    "methods": [
      {
        "name": "Factorización por identidad",
        "steps": [
          "Verificar que la expresión sea de la forma a² - b²",
          "Identificar a = √(primer término) y b = √(segundo término)",
          "Escribir (a + b)(a - b)",
          "Expandir para verificar: (a+b)(a-b) = a² - ab + ab - b² = a² - b² ✓"
        ],
        "when_to_use": "Expresión con dos términos, ambos cuadrados perfectos, separados por resta"
      }
    ]
  }'::jsonb,
  '{
    "mistakes": [
      {"mistake": "Intentar factorizar a² + b²", "fix": "La SUMA de cuadrados no factoriza en ℝ"},
      {"mistake": "Confundir con binomio al cuadrado", "fix": "La diferencia de cuadrados solo tiene 2 términos, no 3"}
    ]
  }'::jsonb,
  '{
    "checks": [
      "Multiplicar los factores conjugados y verificar que se recupera la expresión original",
      "Comprobar que ambos términos originales son efectivamente cuadrados perfectos"
    ]
  }'::jsonb
from topics t
join units u on t.unit_id = u.id
where t.slug = 'diferencia-de-cuadrados'
  and u.id = 'a1000004-0000-0000-0000-000000000001'
on conflict (topic_id) do nothing;

-- KIT 3: Aptitud Verbal — Conectores lógicos
-- (find topic by name since slug may vary)
insert into learning_kits (topic_id, summary_json, methods_json, common_mistakes_json, verification_json)
select
  t.id,
  '{
    "bullets": [
      "Los conectores lógicos indican la relación semántica entre oraciones",
      "Tipos: adición (además, también), contraste (pero, sin embargo, aunque), causa (porque, ya que), consecuencia (por lo tanto, entonces), condición (si, siempre que)",
      "El conector correcto mantiene el sentido lógico del texto",
      "En doble espacio, ambos conectores deben ser coherentes con el párrafo"
    ],
    "notes": [
      "Leer toda la oración antes de elegir: el contexto define el conector"
    ]
  }'::jsonb,
  '{
    "methods": [
      {
        "name": "Método de sustitución contextual",
        "steps": [
          "Leer la oración completa con cada opción en el espacio",
          "Identificar la relación lógica entre las dos ideas (contraste, causa, adición...)",
          "Eliminar los conectores que generan contradicción o cambio de sentido",
          "Verificar que la opción elegida sea gramaticalmente correcta"
        ],
        "when_to_use": "Siempre. Nunca elegir un conector por 'sonido' sino por relación lógica"
      }
    ]
  }'::jsonb,
  '{
    "mistakes": [
      {"mistake": "Elegir 'pero' cuando la relación es de causa", "fix": "Identificar primero si es contraste, causa o consecuencia"},
      {"mistake": "Confundir 'sin embargo' (contraste) con 'por lo tanto' (consecuencia)", "fix": "Sin embargo introduce una idea opuesta; por lo tanto introduce un resultado"}
    ]
  }'::jsonb,
  '{
    "checks": [
      "Reemplazar el conector elegido en la oración y leer en voz alta",
      "Verificar que el sentido sea coherente con el párrafo completo",
      "Confirmar que no se puede usar un conector opuesto sin invertir el sentido"
    ]
  }'::jsonb
from topics t
join units u on t.unit_id = u.id
join courses c on u.course_id = c.id
where c.slug = 'aptitud-verbal'
  and (t.name ilike '%conector%' or t.slug ilike '%conector%')
limit 1
on conflict (topic_id) do nothing;

-- KIT 4: Inglés — Present Simple of Be
insert into learning_kits (topic_id, summary_json, methods_json, common_mistakes_json, verification_json)
select
  t.id,
  '{
    "bullets": [
      "Affirmative: I am / You are / He-She-It is / We-You-They are",
      "Negative: add NOT after BE → I am not / He is not (=isn''t)",
      "Interrogative: invert subject and BE → Are you? / Is he?",
      "Contractions: I''m, you''re, he''s, she''s, it''s, we''re, they''re",
      "Negative contractions: isn''t, aren''t (am not = no contraction)"
    ],
    "notes": [
      "BE is an irregular verb — it does not follow the regular -s rule in 3rd person"
    ]
  }'::jsonb,
  '{
    "methods": [
      {
        "name": "Subject-Verb Agreement check",
        "steps": [
          "Identify the subject of the sentence",
          "Match the subject to the correct form: am / is / are",
          "For negatives: place NOT immediately after the BE form",
          "For questions: move BE before the subject"
        ],
        "when_to_use": "Any sentence using BE as the main verb in present tense"
      }
    ]
  }'::jsonb,
  '{
    "mistakes": [
      {"mistake": "Using ''is'' with plural subjects: ''They is happy''", "fix": "Plural → ARE: They are happy"},
      {"mistake": "Forgetting agreement in questions: ''You is a student?''", "fix": "Invert correctly: Are you a student?"},
      {"mistake": "Using ''amn''t'' as contraction of ''am not''", "fix": "Am not has no standard contraction in formal English"}
    ]
  }'::jsonb,
  '{
    "checks": [
      "Can you identify the subject and confirm it matches the BE form used?",
      "If negative: is NOT placed immediately after BE?",
      "If question: is BE placed before the subject?"
    ]
  }'::jsonb
from topics t
join units u on t.unit_id = u.id
join courses c on u.course_id = c.id
where c.slug = 'ingles'
  and (t.name ilike '%be%' or t.slug ilike '%be%' or t.name ilike '%present simple%')
limit 1
on conflict (topic_id) do nothing;

-- ────────────────────────────────────────────────────────────
--  QUESTION SOLUTION META  (asociar preguntas dummy a plantillas)
--  Asocia las preguntas de álgebra a la plantilla de factorización
-- ────────────────────────────────────────────────────────────
insert into question_solution_meta (question_id, template_id, skill_tags, trap_tags, difficulty)
select
  q.id,
  'aaaa0002-0000-0000-0000-000000000001'::uuid,
  array['productos-notables','factorizacion'],
  array['termino-medio','signo'],
  q.difficulty::text::int
from questions q
join topics t on q.topic_id = t.id
join units u on t.unit_id = u.id
where u.id = 'a1000004-0000-0000-0000-000000000001'
on conflict (question_id) do nothing;

-- Asociar preguntas de ecuaciones a plantilla lineal
insert into question_solution_meta (question_id, template_id, skill_tags, trap_tags, difficulty)
select
  q.id,
  'aaaa0001-0000-0000-0000-000000000001'::uuid,
  array['ecuacion-lineal','despeje'],
  array['signo','transposicion'],
  q.difficulty::text::int
from questions q
join topics t on q.topic_id = t.id
join units u on t.unit_id = u.id
where u.id = 'a1000001-0000-0000-0000-000000000001'
on conflict (question_id) do nothing;
