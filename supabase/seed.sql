-- ================================================================
--  SEED SCRIPT — Courses, Units, Topics + 10 dummy questions/course
--  Run AFTER schema.sql
--  Execute in: Supabase Dashboard → SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────
--  COURSES
-- ────────────────────────────────────────────────────────────
insert into courses (id, name, slug, "order") values
  ('11111111-0000-0000-0000-000000000001', 'Álgebra',        'algebra',        1),
  ('11111111-0000-0000-0000-000000000002', 'Aptitud Verbal', 'aptitud-verbal',  2),
  ('11111111-0000-0000-0000-000000000003', 'Inglés',         'ingles',          3)
on conflict (slug) do nothing;

-- ────────────────────────────────────────────────────────────
--  UNITS — ÁLGEBRA
-- ────────────────────────────────────────────────────────────
insert into units (id, course_id, name, slug, "order") values
  ('a1000001-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Ecuación lineal y cuadrática','ecuacion-lineal-y-cuadratica',1),
  ('a1000002-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Teoría de exponentes','teoria-de-exponentes',2),
  ('a1000003-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Polinomios','polinomios',3),
  ('a1000004-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Productos notables','productos-notables',4),
  ('a1000005-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','División algebraica','division-algebraica',5),
  ('a1000006-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Factorización','factorizacion',6),
  ('a1000007-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Teoría de matrices','teoria-de-matrices',7),
  ('a1000008-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Inecuaciones','inecuaciones',8),
  ('a1000009-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Funciones','funciones',9)
on conflict (course_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U1
insert into topics (unit_id, name, slug, "order") values
  ('a1000001-0000-0000-0000-000000000001','Ecuación lineal - resolución','ecuacion-lineal-resolucion',1),
  ('a1000001-0000-0000-0000-000000000001','Ecuación cuadrática: resolución por factorización y fórmula general','ecuacion-cuadratica-factorizacion-y-formula-general',2),
  ('a1000001-0000-0000-0000-000000000001','Propiedades de las raíces','propiedades-de-las-raices',3),
  ('a1000001-0000-0000-0000-000000000001','Análisis de la discriminante, reconstrucción de una ecuación','discriminante-y-reconstruccion-de-ecuacion',4)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U2
insert into topics (unit_id, name, slug, "order") values
  ('a1000002-0000-0000-0000-000000000001','Leyes de exponente, Leyes de radicales','leyes-de-exponente-y-radicales',1),
  ('a1000002-0000-0000-0000-000000000001','Teoremas: bases iguales, potencia de potencia y exponentes iguales','teoremas-bases-iguales-potencia-de-potencia-exponentes-iguales',2),
  ('a1000002-0000-0000-0000-000000000001','Exponentes racionales, Teoremas: índices iguales, raíz de raíz y radicales sucesivos','exponentes-racionales-indices-iguales-raiz-de-raiz-radicales-sucesivos',3)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U3
insert into topics (unit_id, name, slug, "order") values
  ('a1000003-0000-0000-0000-000000000001','Polinomios (de una o más variables)','polinomios-una-o-mas-variables',1),
  ('a1000003-0000-0000-0000-000000000001','Igualdad de polinomios','igualdad-de-polinomios',2),
  ('a1000003-0000-0000-0000-000000000001','Grado de un polinomio. Grado absoluto y relativo','grado-absoluto-y-relativo',3),
  ('a1000003-0000-0000-0000-000000000001','Polinomios especiales: homogéneo, completos, ordenados, idénticos, idénticamente nulo. Propiedades','polinomios-especiales-y-propiedades',4)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U4
insert into topics (unit_id, name, slug, "order") values
  ('a1000004-0000-0000-0000-000000000001','Binomio al cuadrado','binomio-al-cuadrado',1),
  ('a1000004-0000-0000-0000-000000000001','Diferencia de cuadrados','diferencia-de-cuadrados',2),
  ('a1000004-0000-0000-0000-000000000001','Identidades de Legendre','identidades-de-legendre',3),
  ('a1000004-0000-0000-0000-000000000001','Binomio al cubo','binomio-al-cubo',4),
  ('a1000004-0000-0000-0000-000000000001','Suma y diferencia de cubos','suma-y-diferencia-de-cubos',5),
  ('a1000004-0000-0000-0000-000000000001','Trinomio al cuadrado','trinomio-al-cuadrado',6),
  ('a1000004-0000-0000-0000-000000000001','Trinomio al cubo','trinomio-al-cubo',7),
  ('a1000004-0000-0000-0000-000000000001','Identidades auxiliares','identidades-auxiliares',8)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U5
insert into topics (unit_id, name, slug, "order") values
  ('a1000005-0000-0000-0000-000000000001','División de polinomios: Método clásico','division-de-polinomios-metodo-clasico',1),
  ('a1000005-0000-0000-0000-000000000001','Horner y Ruffini','horner-y-ruffini',2),
  ('a1000005-0000-0000-0000-000000000001','Teorema del Resto','teorema-del-resto',3)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U6
insert into topics (unit_id, name, slug, "order") values
  ('a1000006-0000-0000-0000-000000000001','Factor común','factor-comun',1),
  ('a1000006-0000-0000-0000-000000000001','Factorización por identidades','factorizacion-por-identidades',2),
  ('a1000006-0000-0000-0000-000000000001','Aspa simple','aspa-simple',3),
  ('a1000006-0000-0000-0000-000000000001','Aspa doble','aspa-doble',4),
  ('a1000006-0000-0000-0000-000000000001','Aspa doble especial','aspa-doble-especial',5),
  ('a1000006-0000-0000-0000-000000000001','Divisiones sucesivas','divisiones-sucesivas',6),
  ('a1000006-0000-0000-0000-000000000001','Lema de Gauss','lema-de-gauss',7),
  ('a1000006-0000-0000-0000-000000000001','MCD y MCM de polinomios','mcd-y-mcm-de-polinomios',8),
  ('a1000006-0000-0000-0000-000000000001','Raíz cuadrada de un polinomio','raiz-cuadrada-de-un-polinomio',9),
  ('a1000006-0000-0000-0000-000000000001','Radicales dobles','radicales-dobles',10),
  ('a1000006-0000-0000-0000-000000000001','Racionalización de numeradores y de denominadores','racionalizacion-de-numeradores-y-denominadores',11)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U7
insert into topics (unit_id, name, slug, "order") values
  ('a1000007-0000-0000-0000-000000000001','Definición, igualdad','definicion-e-igualdad',1),
  ('a1000007-0000-0000-0000-000000000001','Tipos de matrices: cuadrada, nula, diagonal, escalar, identidad, triangular superior, triangular inferior','tipos-de-matrices',2),
  ('a1000007-0000-0000-0000-000000000001','La traza y transpuesta y sus propiedades','traza-y-transpuesta',3),
  ('a1000007-0000-0000-0000-000000000001','Matriz simétrica, antisimétrica. Propiedades','simetrica-y-antisimetrica',4),
  ('a1000007-0000-0000-0000-000000000001','Operaciones con matrices: adición, sustracción, multiplicación, propiedades','operaciones-con-matrices',5),
  ('a1000007-0000-0000-0000-000000000001','Determinantes de orden dos y de orden tres','determinantes-2x2-y-3x3',6)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U8
insert into topics (unit_id, name, slug, "order") values
  ('a1000008-0000-0000-0000-000000000001','Inecuaciones de primer grado','inecuaciones-de-primer-grado',1),
  ('a1000008-0000-0000-0000-000000000001','Inecuaciones cuadráticas. Método de los valores críticos para resolver inecuaciones','inecuaciones-cuadraticas-valores-criticos',2),
  ('a1000008-0000-0000-0000-000000000001','Inecuaciones de grado superior e inecuaciones racionales','inecuaciones-grado-superior-y-racionales',3)
on conflict (unit_id, slug) do nothing;

-- TOPICS — ÁLGEBRA U9
insert into topics (unit_id, name, slug, "order") values
  ('a1000009-0000-0000-0000-000000000001','Definición, dominio y rango','definicion-dominio-y-rango',1),
  ('a1000009-0000-0000-0000-000000000001','Funciones elementales: constante, lineal, afin, identidad','funciones-elementales',2),
  ('a1000009-0000-0000-0000-000000000001','Funciones reales de una variable real','funciones-reales-de-una-variable-real',3),
  ('a1000009-0000-0000-0000-000000000001','Función cuadrática, cúbica, valor absoluto, raíz cuadrada. Representación gráfica','funciones-y-representacion-grafica',4),
  ('a1000009-0000-0000-0000-000000000001','Propiedades','propiedades',5)
on conflict (unit_id, slug) do nothing;

-- ────────────────────────────────────────────────────────────
--  UNITS — APTITUD VERBAL
-- ────────────────────────────────────────────────────────────
insert into units (id, course_id, name, slug, "order") values
  ('a2000001-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Etimología','etimologia',1),
  ('a2000002-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Conectores lógicos','conectores-logicos',2),
  ('a2000003-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Comprensión de lectura I','comprension-de-lectura-i',3),
  ('a2000004-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Paremología','paremiologia',4),
  ('a2000005-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Oraciones eliminadas','oraciones-eliminadas',5),
  ('a2000006-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Comprensión de lectura II','comprension-de-lectura-ii',6),
  ('a2000007-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Plan de redacción','plan-de-redaccion',7),
  ('a2000008-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Comprensión de lectura III','comprension-de-lectura-iii',8),
  ('a2000009-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Precisión léxica en contexto','precision-lexica-en-contexto',9),
  ('a2000010-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Analogías','analogias',10),
  ('a2000011-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Lectura crítica','lectura-critica',11)
on conflict (course_id, slug) do nothing;

-- TOPICS — APTITUD VERBAL
insert into topics (unit_id, name, slug, "order") values
  ('a2000001-0000-0000-0000-000000000002','Raíces griegas y latinas, y afijos: prefijos, infijos y sufijos','raices-y-afijos',1),
  ('a2000002-0000-0000-0000-000000000002','Conjunciones','conjunciones',1),
  ('a2000002-0000-0000-0000-000000000002','Preposiciones','preposiciones',2),
  ('a2000002-0000-0000-0000-000000000002','Signos de puntuación: (,), (;), (:)','signos-de-puntuacion',3),
  ('a2000003-0000-0000-0000-000000000002','Tipología textual','tipologia-textual',1),
  ('a2000003-0000-0000-0000-000000000002','Formatos textuales: Continuo, Discontinuo, Mixto, Múltiple','formatos-textuales',2),
  ('a2000003-0000-0000-0000-000000000002','Preguntas de retención y traducción','retencion-y-traduccion',3),
  ('a2000004-0000-0000-0000-000000000002','Paremia - interpretación','paremia-interpretacion',1),
  ('a2000004-0000-0000-0000-000000000002','Interpretación - paremia','interpretacion-paremia',2),
  ('a2000004-0000-0000-0000-000000000002','Paremia - paremia','paremia-paremia',3),
  ('a2000004-0000-0000-0000-000000000002','Paremia - síntesis','paremia-sintesis',4),
  ('a2000005-0000-0000-0000-000000000002','Por contradicción','por-contradiccion',1),
  ('a2000005-0000-0000-0000-000000000002','Por rompimiento temático','por-rompimiento-tematico',2),
  ('a2000005-0000-0000-0000-000000000002','Por redundancia','por-redundancia',3),
  ('a2000005-0000-0000-0000-000000000002','Por alejamiento temático','por-alejamiento-tematico',4),
  ('a2000006-0000-0000-0000-000000000002','Preguntas de interpretación','preguntas-de-interpretacion',1),
  ('a2000006-0000-0000-0000-000000000002','Preguntas de inferencia','preguntas-de-inferencia',2),
  ('a2000007-0000-0000-0000-000000000002','Criterio general','criterio-general',1),
  ('a2000007-0000-0000-0000-000000000002','Criterio analítico','criterio-analitico',2),
  ('a2000007-0000-0000-0000-000000000002','Criterio jerárquico','criterio-jerarquico',3),
  ('a2000007-0000-0000-0000-000000000002','Criterio cronológico','criterio-cronologico',4),
  ('a2000007-0000-0000-0000-000000000002','Criterio causal','criterio-causal',5),
  ('a2000007-0000-0000-0000-000000000002','Criterio metodológico','criterio-metodologico',6),
  ('a2000008-0000-0000-0000-000000000002','Preguntas de extrapolación','preguntas-de-extrapolacion',1),
  ('a2000009-0000-0000-0000-000000000002','Concepto','concepto',1),
  ('a2000009-0000-0000-0000-000000000002','Denotación y connotación','denotacion-y-connotacion',2),
  ('a2000009-0000-0000-0000-000000000002','Sentido contextual','sentido-contextual',3),
  ('a2000010-0000-0000-0000-000000000002','Relaciones analógicas principales','relaciones-analogicas-principales',1),
  ('a2000011-0000-0000-0000-000000000002','Preguntas sobre argumentos: De un punto de vista, de diálogo','argumentos-punto-de-vista-y-dialogo',1),
  ('a2000011-0000-0000-0000-000000000002','Preguntas sobre la estructura de un texto: abstracción de estructura, estructura análoga','estructura-abstraccion-y-analoga',2),
  ('a2000011-0000-0000-0000-000000000002','Preguntas sobre intención oculta e información sutil: intención del autor, tono del texto, paradoja','intencion-oculta-tono-paradoja',3),
  ('a2000011-0000-0000-0000-000000000002','Preguntas sobre premisas y conclusiones lógicas','premisas-y-conclusiones-logicas',4)
on conflict (unit_id, slug) do nothing;

-- ────────────────────────────────────────────────────────────
--  UNITS — INGLÉS
-- ────────────────────────────────────────────────────────────
insert into units (id, course_id, name, slug, "order") values
  ('a3000001-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Present Simple of Be','present-simple-of-be',1),
  ('a3000002-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Possessive Adjectives','possessive-adjectives',2),
  ('a3000003-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','There is / There are','there-is-there-are',3),
  ('a3000004-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Present Simple Tense','present-simple-tense',4),
  ('a3000005-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Present Continuous','present-continuous',5),
  ('a3000006-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Future Tense','future-tense',6),
  ('a3000007-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','The Past Simple of Be','past-simple-of-be',7),
  ('a3000008-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Past Simple Tense','past-simple-tense',8),
  ('a3000009-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','The Present Perfect','present-perfect',9),
  ('a3000010-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Adverbs Present Perfect','adverbs-present-perfect',10)
on conflict (course_id, slug) do nothing;

-- TOPICS — INGLÉS
insert into topics (unit_id, name, slug, "order") values
  ('a3000001-0000-0000-0000-000000000003','Affirmative form','affirmative-form',1),
  ('a3000001-0000-0000-0000-000000000003','Negative form','negative-form',2),
  ('a3000001-0000-0000-0000-000000000003','Interrogative form','interrogative-form',3),
  ('a3000002-0000-0000-0000-000000000003','Subject pronoun','subject-pronoun',1),
  ('a3000002-0000-0000-0000-000000000003','Possessive adjective','possessive-adjective',2),
  ('a3000002-0000-0000-0000-000000000003','Possessive S/S''','possessive-s',3),
  ('a3000003-0000-0000-0000-000000000003','The indefinite article A / AN','indefinite-article-a-an',1),
  ('a3000003-0000-0000-0000-000000000003','The indefinite article SOME/ANY','indefinite-article-some-any',2),
  ('a3000004-0000-0000-0000-000000000003','Affirmative form','affirmative-form',1),
  ('a3000004-0000-0000-0000-000000000003','Negative form','negative-form',2),
  ('a3000004-0000-0000-0000-000000000003','Interrogative form','interrogative-form',3),
  ('a3000005-0000-0000-0000-000000000003','Negative form','negative-form',1),
  ('a3000005-0000-0000-0000-000000000003','Interrogative form','interrogative-form',2),
  ('a3000006-0000-0000-0000-000000000003','Be going to: negative form; interrogative form','be-going-to-negative-interrogative',1),
  ('a3000006-0000-0000-0000-000000000003','Will: negative form; interrogative form','will-negative-interrogative',2),
  ('a3000007-0000-0000-0000-000000000003','Past time expressions','past-time-expressions',1),
  ('a3000007-0000-0000-0000-000000000003','Negative form','negative-form',2),
  ('a3000007-0000-0000-0000-000000000003','Interrogative form','interrogative-form',3),
  ('a3000008-0000-0000-0000-000000000003','Negative form','negative-form',1),
  ('a3000008-0000-0000-0000-000000000003','Interrogative form','interrogative-form',2),
  ('a3000009-0000-0000-0000-000000000003','Contractions','contractions',1),
  ('a3000009-0000-0000-0000-000000000003','Negative form','negative-form',2),
  ('a3000009-0000-0000-0000-000000000003','Interrogative form','interrogative-form',3),
  ('a3000010-0000-0000-0000-000000000003','Ever','ever',1),
  ('a3000010-0000-0000-0000-000000000003','Never','never',2),
  ('a3000010-0000-0000-0000-000000000003','Just','just',3),
  ('a3000010-0000-0000-0000-000000000003','Already','already',4),
  ('a3000010-0000-0000-0000-000000000003','Yet','yet',5),
  ('a3000010-0000-0000-0000-000000000003','Prepositions FOR and SINCE','for-and-since',6)
on conflict (unit_id, slug) do nothing;

-- ────────────────────────────────────────────────────────────
--  DUMMY QUESTIONS — 10 per course
--  (All use topic_id from subquery for safety)
-- ────────────────────────────────────────────────────────────

-- ÁLGEBRA questions (all linked to unit 1 / topic 1 for simplicity)
insert into questions (course_id, unit_id, topic_id, prompt_text, options_json, correct_option, explanation_json, difficulty, source_type)
select
  c.id,
  u.id,
  t.id,
  q.prompt_text,
  q.options_json::jsonb,
  q.correct_option,
  q.explanation_json::jsonb,
  q.difficulty,
  'seed'
from
  (values
    (
      'Si 3x - 6 = 0, ¿cuánto vale x?',
      '{"A":"0","B":"1","C":"2","D":"3","E":"6"}',
      'C',
      '{"text":"Despejando x: 3x = 6 → x = 2.","error_comun":"No dividir ambos lados por 3.","verificacion":"Sustituir: 3(2)-6 = 0 ✓"}',
      'easy'
    ),
    (
      '¿Cuál es la solución de 2x + 4 = 10?',
      '{"A":"1","B":"2","C":"3","D":"4","E":"5"}',
      'C',
      '{"text":"2x = 10 - 4 = 6 → x = 3.","error_comun":"No despejar correctamente el término independiente.","verificacion":"2(3)+4 = 10 ✓"}',
      'easy'
    ),
    (
      'La ecuación x² - 5x + 6 = 0 tiene como raíces:',
      '{"A":"x=1 y x=6","B":"x=2 y x=3","C":"x=-2 y x=-3","D":"x=1 y x=-6","E":"x=5 y x=1"}',
      'B',
      '{"text":"Factorizando: (x-2)(x-3)=0 → x=2 o x=3.","error_comun":"Confundir signos al factorizar.","verificacion":"(2)²-5(2)+6=0 ✓ y (3)²-5(3)+6=0 ✓"}',
      'medium'
    ),
    (
      'El discriminante de x² - 4x + 4 = 0 es:',
      '{"A":"-4","B":"0","C":"4","D":"8","E":"16"}',
      'B',
      '{"text":"Δ = b²-4ac = 16-16 = 0. Raíz doble.","error_comun":"Olvidar multiplicar por 4ac.","verificacion":"Δ=(-4)²-4(1)(4)=16-16=0 ✓"}',
      'medium'
    ),
    (
      'Simplifica: (x³·x⁴) / x²',
      '{"A":"x³","B":"x⁵","C":"x⁷","D":"x⁹","E":"x²"}',
      'B',
      '{"text":"x³·x⁴ = x⁷, luego x⁷/x² = x⁵.","error_comun":"Multiplicar exponentes en lugar de sumarlos.","verificacion":"x^(3+4-2)=x^5 ✓"}',
      'easy'
    ),
    (
      'El grado absoluto del polinomio P(x,y) = 3x²y³ + 2xy es:',
      '{"A":"2","B":"3","C":"4","D":"5","E":"6"}',
      'D',
      '{"text":"El grado de 3x²y³ es 2+3=5; el de 2xy es 1+1=2. El grado absoluto es el mayor: 5.","error_comun":"Confundir grado relativo con absoluto.","verificacion":"Pendiente de solucionario."}',
      'medium'
    ),
    (
      '¿Cuánto es (a+b)²?',
      '{"A":"a²+b²","B":"a²-b²","C":"a²+2ab+b²","D":"a²-2ab+b²","E":"2a+2b"}',
      'C',
      '{"text":"(a+b)² = a²+2ab+b² por el producto notable binomio al cuadrado.","error_comun":"Olvidar el término medio 2ab.","verificacion":"Expandir: (a+b)(a+b)=a²+ab+ab+b²=a²+2ab+b² ✓"}',
      'easy'
    ),
    (
      'La diferencia de cuadrados a² - b² se factoriza como:',
      '{"A":"(a+b)²","B":"(a-b)²","C":"(a+b)(a-b)","D":"(a²+b)(a-b²)","E":"a(a-b²)"}',
      'C',
      '{"text":"Identidad: a²-b² = (a+b)(a-b).","error_comun":"Confundir con el cuadrado de la diferencia.","verificacion":"(a+b)(a-b)=a²-ab+ab-b²=a²-b² ✓"}',
      'easy'
    ),
    (
      'Al dividir P(x)=x³-2x²+3x-4 entre (x-1), el residuo es:',
      '{"A":"-2","B":"-1","C":"0","D":"1","E":"2"}',
      'A',
      '{"text":"Por Teorema del Resto: P(1)=1-2+3-4=-2.","error_comun":"Evaluar en x=-1 en lugar de x=1.","verificacion":"P(1)=1-2+3-4=-2 ✓"}',
      'medium'
    ),
    (
      'La solución de la inecuación 2x - 4 > 0 es:',
      '{"A":"x < 2","B":"x > 2","C":"x = 2","D":"x ≤ 2","E":"x ≥ 2"}',
      'B',
      '{"text":"2x > 4 → x > 2.","error_comun":"Invertir el sentido de la desigualdad sin dividir por negativo.","verificacion":"Para x=3: 2(3)-4=2>0 ✓"}',
      'easy'
    )
  ) as q(prompt_text, options_json, correct_option, explanation_json, difficulty)
  cross join courses c
  join units u on u.course_id = c.id
  join topics t on t.unit_id = u.id
where c.slug = 'algebra'
  and u.slug = 'ecuacion-lineal-y-cuadratica'
  and t.slug = 'ecuacion-lineal-resolucion';

-- APTITUD VERBAL questions
insert into questions (course_id, unit_id, topic_id, prompt_text, options_json, correct_option, explanation_json, difficulty, source_type)
select
  c.id,
  u.id,
  t.id,
  q.prompt_text,
  q.options_json::jsonb,
  q.correct_option,
  q.explanation_json::jsonb,
  q.difficulty,
  'seed'
from
  (values
    (
      'El prefijo griego "bio-" significa:',
      '{"A":"tierra","B":"agua","C":"vida","D":"fuego","E":"luz"}',
      'C',
      '{"text":"\"Bio\" proviene del griego bios = vida. Ejemplo: biología = estudio de la vida.","error_comun":"Confundirlo con \"geo\" (tierra).","verificacion":"Pendiente de solucionario."}',
      'easy'
    ),
    (
      'El sufijo "-logía" denota:',
      '{"A":"amor","B":"estudio o tratado","C":"fobia","D":"movimiento","E":"forma"}',
      'B',
      '{"text":"-logía proviene del griego logos = razón, estudio. Psicología = estudio de la psique.","error_comun":"Confundirlo con \"-filia\" (amor).","verificacion":"Pendiente de solucionario."}',
      'easy'
    ),
    (
      'Identifica el conector lógico de consecuencia: "Estudió mucho ___ aprobó el examen."',
      '{"A":"pero","B":"aunque","C":"sin embargo","D":"por eso","E":"ni"}',
      'D',
      '{"text":"\"Por eso\" introduce una consecuencia o resultado. Es un conector consecutivo.","error_comun":"Confundir conectores adversativos (pero) con consecutivos.","verificacion":"Pendiente de solucionario."}',
      'medium'
    ),
    (
      'Señala la oración que contiene una CONTRADICCIÓN con el resto: I. El sol es una estrella. II. El sol brilla de noche. III. El sol emite luz propia. IV. El sol es de tipo G.',
      '{"A":"I","B":"II","C":"III","D":"IV","E":"I y III"}',
      'B',
      '{"text":"La oración II contradice el conocimiento básico: el sol no brilla de noche (no es visible, pero la razón es la rotación terrestre). Es la oración eliminada por contradicción.","error_comun":"Pendiente de solucionario.","verificacion":"Pendiente de solucionario."}',
      'medium'
    ),
    (
      'En el texto: "El agua es vital para los seres vivos. El agua cubre el 71% de la Tierra. Los peces viven en agua. La sal es un mineral." ¿Qué oración se eliminaría por alejamiento temático?',
      '{"A":"El agua es vital para los seres vivos","B":"El agua cubre el 71% de la Tierra","C":"Los peces viven en agua","D":"La sal es un mineral","E":"Ninguna"}',
      'D',
      '{"text":"\"La sal es un mineral\" es ajena al tema central del agua. Se elimina por alejamiento temático.","error_comun":"Pendiente de solucionario.","verificacion":"Pendiente de solucionario."}',
      'medium'
    ),
    (
      'El refrán "A buen entendedor, pocas palabras" equivale a:',
      '{"A":"Los inteligentes necesitan muchas explicaciones","B":"Una persona inteligente comprende con pocos indicios","C":"Es mejor callar que hablar","D":"Las palabras sobran cuando hay acción","E":"El silencio es sabiduría"}',
      'B',
      '{"text":"El proverbio indica que quien tiene capacidad de entender no necesita explicaciones extensas.","error_comun":"Pendiente de solucionario.","verificacion":"Pendiente de solucionario."}',
      'easy'
    ),
    (
      'LUNA : NOCHE :: SOL : ___',
      '{"A":"calor","B":"astro","C":"DÍA","D":"luz","E":"estrella"}',
      'C',
      '{"text":"La relación es objeto-contexto temporal: La luna se asocia con la noche; el sol se asocia con el día.","error_comun":"Confundir la relación objeto-característica con objeto-contexto.","verificacion":"Pendiente de solucionario."}',
      'easy'
    ),
    (
      'MÉDICO : ESTETOSCOPIO :: CARPINTERO : ___',
      '{"A":"madera","B":"SERRUCHO","C":"hospital","D":"enfermedad","E":"clínica"}',
      'B',
      '{"text":"La relación es agente-instrumento. El serrucho es el instrumento del carpintero, como el estetoscopio es el del médico.","error_comun":"Confundir con relación agente-lugar.","verificacion":"Pendiente de solucionario."}',
      'easy'
    ),
    (
      'En el contexto "El político usó un lenguaje MORDAZ para atacar a su rival", MORDAZ significa:',
      '{"A":"amable","B":"extenso","C":"hiriente y sarcástico","D":"confuso","E":"técnico"}',
      'C',
      '{"text":"MORDAZ en contexto de crítica política indica algo que hiere, que es incisivo y sarcástico.","error_comun":"Pendiente de solucionario.","verificacion":"Pendiente de solucionario."}',
      'medium'
    ),
    (
      'La denotación de la palabra "paloma" es:',
      '{"A":"paz y amor","B":"libertad","C":"ave de la familia Columbidae","D":"pureza","E":"mensajero"}',
      'C',
      '{"text":"La denotación es el significado literal y objetivo de la palabra. La paloma es biológicamente un ave.","error_comun":"Confundir denotación (significado literal) con connotación (significado simbólico).","verificacion":"Pendiente de solucionario."}',
      'easy'
    )
  ) as q(prompt_text, options_json, correct_option, explanation_json, difficulty)
  cross join courses c
  join units u on u.course_id = c.id
  join topics t on t.unit_id = u.id
where c.slug = 'aptitud-verbal'
  and u.slug = 'etimologia'
  and t.slug = 'raices-y-afijos';

-- INGLÉS questions
insert into questions (course_id, unit_id, topic_id, prompt_text, options_json, correct_option, explanation_json, difficulty, source_type)
select
  c.id,
  u.id,
  t.id,
  q.prompt_text,
  q.options_json::jsonb,
  q.correct_option,
  q.explanation_json::jsonb,
  q.difficulty,
  'seed'
from
  (values
    (
      'Complete: "She ___ a student."',
      '{"A":"am","B":"is","C":"are","D":"be","E":"been"}',
      'B',
      '{"text":"With third person singular (she/he/it), we use \"is\".","error_comun":"Using \"are\" for singular subjects.","verificacion":"She is a student. ✓"}',
      'easy'
    ),
    (
      'Choose the correct negative: "They ___ from Peru."',
      '{"A":"is not","B":"am not","C":"are not","D":"not are","E":"be not"}',
      'C',
      '{"text":"With plural subjects (they), we use \"are not\" or \"aren''t\".","error_comun":"Using \"is not\" for plural subjects.","verificacion":"They are not from Peru. ✓"}',
      'easy'
    ),
    (
      'Choose the possessive adjective for "I": "This is ___ book."',
      '{"A":"me","B":"mine","C":"my","D":"I","E":"myself"}',
      'C',
      '{"text":"The possessive adjective for \"I\" is \"my\". It goes before a noun.","error_comun":"Using \"mine\" which is a possessive pronoun, not an adjective.","verificacion":"This is my book. ✓"}',
      'easy'
    ),
    (
      'Complete with There is / There are: "___ a cat in the house."',
      '{"A":"There are","B":"There is","C":"There am","D":"It is","E":"They are"}',
      'B',
      '{"text":"\"There is\" is used with singular countable nouns: a cat (singular).","error_comun":"Using \"There are\" with singular nouns.","verificacion":"There is a cat in the house. ✓"}',
      'easy'
    ),
    (
      'Choose the correct sentence in Present Simple: "He ___ to school every day."',
      '{"A":"go","B":"goes","C":"going","D":"gone","E":"is go"}',
      'B',
      '{"text":"Third person singular (he/she/it) adds -s/-es to the base verb: go → goes.","error_comun":"Not adding -s/-es for third person singular.","verificacion":"He goes to school every day. ✓"}',
      'easy'
    ),
    (
      'Make it negative: "She plays tennis." → She ___ tennis.',
      '{"A":"don''t plays","B":"doesn''t play","C":"isn''t play","D":"not plays","E":"doesn''t plays"}',
      'B',
      '{"text":"Negative in Present Simple (3rd person singular): subject + doesn''t + base verb.","error_comun":"Adding -s to the main verb after doesn''t.","verificacion":"She doesn''t play tennis. ✓"}',
      'medium'
    ),
    (
      'Complete in Present Continuous: "They ___ football now."',
      '{"A":"plays","B":"play","C":"are playing","D":"is playing","E":"were playing"}',
      'C',
      '{"text":"Present Continuous: subject + am/is/are + verb-ing. \"They\" uses \"are\".","error_comun":"Using \"is\" with \"they\".","verificacion":"They are playing football now. ✓"}',
      'easy'
    ),
    (
      'Future with "going to": "I ___ visit my grandma tomorrow."',
      '{"A":"am going to","B":"is going to","C":"are going to","D":"will going to","E":"going to"}',
      'A',
      '{"text":"With \"I\", the correct form is \"am going to\" + base verb.","error_comun":"Using \"will going to\" (double future marker).","verificacion":"I am going to visit my grandma tomorrow. ✓"}',
      'easy'
    ),
    (
      'Past Simple of Be — negative: "He ___ at school yesterday."',
      '{"A":"isn''t","B":"wasn''t","C":"weren''t","D":"not was","E":"didn''t be"}',
      'B',
      '{"text":"Past Simple of Be, 3rd person singular negative: wasn''t (was not).","error_comun":"Using \"isn''t\" (Present Simple negative).","verificacion":"He wasn''t at school yesterday. ✓"}',
      'easy'
    ),
    (
      'Present Perfect with "ever": "___ you ever ___ sushi?',
      '{"A":"Have / eat","B":"Has / eaten","C":"Have / eaten","D":"Did / eat","E":"Have / ate"}',
      'C',
      '{"text":"Present Perfect interrogative: Have/Has + subject + past participle. \"You\" → Have; eat → eaten.","error_comun":"Using \"ate\" (Past Simple) instead of \"eaten\" (past participle).","verificacion":"Have you ever eaten sushi? ✓"}',
      'medium'
    )
  ) as q(prompt_text, options_json, correct_option, explanation_json, difficulty)
  cross join courses c
  join units u on u.course_id = c.id
  join topics t on t.unit_id = u.id
where c.slug = 'ingles'
  and u.slug = 'present-simple-of-be'
  and t.slug = 'affirmative-form';
