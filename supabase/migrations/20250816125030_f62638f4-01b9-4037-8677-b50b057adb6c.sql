-- Seed data for the educational PWA
INSERT INTO public.courses (id, title, subtitle) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Estudos Dinâmica – Prof Newton', 'Engenharia Mecânica EEP – 2025');

INSERT INTO public.lessons (id, course_id, title, number) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Aula 1: Barra sob carregamento axial', 1);

-- Insert lesson items
INSERT INTO public.lesson_items (id, lesson_id, title, type, content_markdown, order_index) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440002',
  'Carregamento axial',
  'theory',
  '# Carregamento Axial

O carregamento axial é um tipo fundamental de solicitação em elementos estruturais onde as forças são aplicadas ao longo do eixo principal do elemento.

## Definição

Uma barra está submetida a **carregamento axial** quando as forças aplicadas são paralelas ao seu eixo longitudinal, resultando em:

- **Tração**: quando as forças tendem a alongar a barra
- **Compressão**: quando as forças tendem a encurtar a barra

## Tensão Normal

A tensão normal ($\sigma$) é definida como:

$$\sigma = \frac{P}{A}$$

Onde:
- $P$ = força axial aplicada (N)
- $A$ = área da seção transversal (m²)
- $\sigma$ = tensão normal (Pa ou N/m²)

## Deformação Axial

A deformação axial ($\varepsilon$) é dada por:

$$\varepsilon = \frac{\Delta L}{L_0}$$

Onde:
- $\Delta L$ = variação do comprimento
- $L_0$ = comprimento inicial
- $\varepsilon$ = deformação (adimensional)

## Lei de Hooke

Para materiais elásticos lineares:

$$\sigma = E \cdot \varepsilon$$

Onde $E$ é o módulo de elasticidade do material.',
  0
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440002',
  'Tensão de cisalhamento',
  'theory',
  '# Tensão de Cisalhamento

A tensão de cisalhamento surge quando forças são aplicadas paralelamente à seção transversal do elemento.

## Conceito Fundamental

A **tensão de cisalhamento** ($\tau$) é a componente da tensão que atua tangencialmente à superfície de um elemento.

## Fórmula Básica

Para cisalhamento simples:

$$\tau = \frac{V}{A}$$

Onde:
- $V$ = força cortante (N)
- $A$ = área da seção transversal (m²)
- $\tau$ = tensão de cisalhamento (Pa)

## Distribuição de Tensões

Em vigas, a tensão de cisalhamento varia ao longo da altura da seção transversal segundo a fórmula:

$$\tau = \frac{VQ}{Ib}$$

Onde:
- $V$ = força cortante
- $Q$ = momento estático da área
- $I$ = momento de inércia da seção
- $b$ = largura da seção no ponto considerado

## Deformação Angular

A deformação por cisalhamento ($\gamma$) está relacionada com a tensão através do módulo de cisalhamento:

$$\tau = G \cdot \gamma$$

Onde $G$ é o módulo de cisalhamento do material.

## Relação entre Módulos

Para materiais isotrópicos:

$$G = \frac{E}{2(1 + \nu)}$$

Onde $\nu$ é o coeficiente de Poisson.',
  1
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440002',
  'Cálculo de tensão normal em eixos',
  'example',
  '# Exemplo: Cálculo de Tensão Normal em Eixos

## Problema

Um eixo de aço com diâmetro de 50 mm está submetido a uma força axial de tração de 100 kN. Determine a tensão normal no eixo.

## Dados

- Diâmetro: $d = 50$ mm = $0,05$ m
- Força axial: $P = 100$ kN = $100.000$ N
- Material: Aço

## Solução

### Passo 1: Calcular a área da seção transversal

Para uma seção circular:

$$A = \frac{\pi d^2}{4}$$

$$A = \frac{\pi \times (0,05)^2}{4} = \frac{\pi \times 0,0025}{4} = 1,963 \times 10^{-3} \text{ m}^2$$

### Passo 2: Calcular a tensão normal

Aplicando a fórmula da tensão normal:

$$\sigma = \frac{P}{A} = \frac{100.000}{1,963 \times 10^{-3}} = 50,9 \times 10^6 \text{ Pa}$$

$$\sigma = 50,9 \text{ MPa}$$

## Resultado

A tensão normal no eixo é de **50,9 MPa**.

## Verificação

Para aço estrutural comum ($f_y \approx 250$ MPa), a tensão calculada está bem abaixo do limite de escoamento, indicando que o eixo está em regime elástico.',
  2
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440002',
  'Exercício: Tensão de cisalhamento conceitual',
  'exercise',
  '',
  3
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440002',
  'Exercício: Cálculo numérico de tensão',
  'exercise',
  '',
  4
);

-- Insert exercises
INSERT INTO public.exercises (id, lesson_item_id, type, question, options, answer, tolerance) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440006',
  'mcq',
  'Qual das seguintes afirmações sobre tensão de cisalhamento é CORRETA?',
  '["A tensão de cisalhamento sempre é maior que a tensão normal", "A tensão de cisalhamento atua perpendicularmente à seção transversal", "A tensão de cisalhamento atua tangencialmente à superfície do elemento", "A tensão de cisalhamento não existe em elementos tracionados"]',
  'A tensão de cisalhamento atua tangencialmente à superfície do elemento',
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440007',
  'numeric',
  'Uma barra de aço com seção transversal circular de diâmetro 30 mm está submetida a uma força axial de tração de 80 kN. O módulo de elasticidade do aço é E = 200 GPa. Se a deformação específica medida foi ε = 2,0 × 10⁻³, calcule a tensão normal σₓ usando a Lei de Hooke: σₓ = E × εₓ.

**Dados:**
- E = 200 GPa = 200 × 10⁹ Pa  
- εₓ = 2,0 × 10⁻³

**Calcule σₓ em MPa.**',
  '400',
  1.0
);