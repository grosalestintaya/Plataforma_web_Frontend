# Guía base para construcción de vistas de misiones

> Documento maestro para diseñar, documentar e implementar vistas de misión de forma consistente, reusable y escalable.

Esta guía define las piezas, reglas y contratos mínimos para construir vistas de misión. Está pensada como un documento vivo: podrá crecer con nuevos elementos compuestos, nuevas interacciones, nuevos templates, nuevas variantes y nuevos minijuegos sin perder coherencia.

## Objetivo del documento

Definir el sistema mínimo necesario para diseñar, documentar e implementar vistas de misión de forma consistente.

El documento funciona como referencia operativa para:
- diseño de contenido,
- estructura visual,
- interacción,
- navegación.

## Niveles del sistema

| Nivel | Función |
|---|---|
| Elementos base | Piezas mínimas del sistema |
| Elementos compuestos | Combinaciones reutilizables |
| Minijuegos | Componentes interactivos con criterio de completitud |
| Templates | Estructuras de vista |
| Vistas | Aplicación concreta en una misión |

---

# Registro maestro de elementos base

## Grupos

| Grupo | Descripción |
|---|---|
| Tipografía | Jerarquía de texto y lectura de la interfaz |
| Media | Organización de recursos visuales, auditivos y audiovisuales |
| Acción | Controles que disparan navegación o interacción |

## 1. Tipografía

| Elemento | Variante | Uso recomendado |
|---|---|---|
| Heading | eyebrow | Etiqueta superior de módulo, misión o categoría |
| Heading | h1 | Título principal de la vista |
| Heading | h2 | Subtítulo fuerte o idea principal secundaria |
| Heading | h3 | Encabezado menor dentro de la misma vista |
| Text | body | Texto principal de lectura |
| Text | bodySm | Texto secundario o instrucciones breves |
| Text | caption | Pie de imagen o aclaración |
| Text | label | Etiquetas cortas, opciones, estados |
| Text | helper | Ayuda, pista o mensaje auxiliar |

## 2. Media

| Elemento | Variante | Uso recomendado |
|---|---|---|
| Image | simple | Para mostrar imágenes estáticas o ilustrativas |
| Audio | simple | Para reproducir audios de apoyo o consignas |
| Video | simple | Para reproducir videos o clips demostrativos |

## 3. Acción

| Elemento | Variante | Uso recomendado |
|---|---|---|
| Button | simple | Para navegar en la plataforma o activar una interacción |
| Button | primary | Acción principal de la vista |
| Button | secondary | Acción complementaria |
| Button | ghost | Acción secundaria con menor énfasis |

## 4. Input

| Elemento | Variante | Uso recomendado |
|---|---|---|
| Input | text | Entrada de texto |
| Input | radio | Selección de opción |

---

# Registro maestro de elementos compuestos

## Grupos

| Grupo | Descripción |
|---|---|
| Contenedor | Encapsula contenido y le da una superficie visual o funcional propia |
| Agrupador | Organiza varios elementos simples o compuestos dentro de una misma vista |
| Interactivo | Pieza reutilizable con regla de interacción y criterio de completitud |

## 1. Contenedor

| Nombre | Variantes | Descripción | Elementos base |
|---|---|---|---|
| Card | simple | Tarjeta base de contenido | Heading + Image + Text |
| Modal | simple | Ventana emergente de apoyo o ampliación | Heading + Text + Image + Button |
| Form | simple | Formulario | Text + Input |

## 2. Agrupador

| Nombre | Variantes | Descripción | Elementos base |
|---|---|---|---|
| CompareCard | simple | Compara 2 elementos lado a lado | Card + Card |
| RowCard | simple | Muestra 2 o más tarjetas en horizontal | Card[] |
| CollageCard | simple | Muestra varias tarjetas en cuadrícula | Card[] |

## 3. Interactivo

| Nombre | Variantes | Descripción | Elementos base |
|---|---|---|---|
| FlipCard | simple | Tarjeta volteable con frente y reverso | Card |
| MemoryPairs | simple | Juego de memoria por pares | CollageCard |
| ChooseOne | simple | Selección única de respuesta o decisión | Text + CompareCard |
| Calculator | simple | Muestra y/o suma valores de ítems | Text + Button |

---

# Registro maestro de templates

## Templates de vista

| Nombre | Descripción | Uso principal |
|---|---|---|
| Lobby | Un espacio antes, después o de espera del desarrollo de la misión | Espacio del usuario |
| Theory | Muestra contenido conceptual o explicativo | Explicación y teoría |
| Quiz | Presenta preguntas o mini evaluación | Evaluación |

## Templates de minijuegos / actividad

| Nombre | Descripción | Uso principal |
|---|---|---|
| DailySpending | Minijuego donde se gasta un monto de dinero en un día del estudiante | Práctica |
| ObjectClassification | Clasifica entre necesidades y deseos | Práctica |
| BudgetAdjustment | Tienes un ingreso y debes hacer gastos, ajusta el presupuesto para que no te falte nada | Práctica |
| CollectObjects | Recolecta el dinero para que puedas ahorrar | Práctica |
| WhatWouldYouDo | Se te presentan distintas situaciones y tienes una lista de opciones; escoge la mejor y mira qué pasa | Práctica |

---

# Registro maestro de slots

La construcción de variantes sigue esta lógica:

**variante + layout + slots por template**

Cada slot define el tipo de contenido que puede entrar en una vista y orienta la implementación técnica.

## 1. Template `Lobby`

| Variante | Distribución columnas | Distribución filas | Slots obligatorios | Slots opcionales |
|---|---|---|---|---|
| preGame | `1fr` | `1fr + 1fr + auto + (1fr)*` | `title`, `body`, `media` | `title + body + media` |
| postGame | `1fr` | `1fr + auto + 1fr` | `title`, `media`, `feedback` | `title + media + feedback` |
| wait | `1fr` | `1fr + auto` | `title`, `media` | `title + media` |

## 2. Template `Theory`

| Variante | Distribución columnas | Distribución filas | Slots obligatorios | Slots opcionales |
|---|---|---|---|---|
| simple | `1fr` | `1fr + 1fr + auto + (1fr)*` | `title`, `body`, `media`, `feedback*` | `title + body + media + feedback*` |
| explanation | `1fr` | `1fr + (1fr)* + auto` | `title`, `subtitle*`, `media` | `title + media + subtitle*` |
| split | `1fr + 1fr` | `1fr + auto + (1fr)*` | `title`, `body`, `media`, `feedback*` | `title + body + media + feedback*` |
| assessment | `1fr` | `1fr + 1fr` | `title`, `assessment` | `title + assessment` |

## 3. Template `Quiz`

| Variante | Distribución columnas | Distribución filas | Slots obligatorios | Slots opcionales |
|---|---|---|---|---|
| simple | `1fr` | `1fr + 1fr + (1fr)*` | `title`, `action`, `feedback*` | `title + action + feedback*` |
| extended | `1fr + 1fr` | `1fr + auto + (1fr)*` | `title`, `action`, `media`, `input`, `feedback*` | `title + action + input + media + feedback*` |

## 4. Template `DailySpending`

| Variante | Distribución columnas | Distribución filas | Slots obligatorios | Slots opcionales |
|---|---|---|---|---|
| decision | `2fr + 1fr` | `1fr + auto + (1fr)*` | `title`, `amount`, `assessment`, `feedback*` | `title + amount + assessment + feedback*` |
| shop | `2fr + 1fr` | `1fr + 1fr + (auto)*` | `title`, `amount`, `situation`, `media`, `options`, `feedback*` | `title + amount + situation + media + options + feedback*` |
| event | `2fr + 1fr` | `1fr + 1fr + (auto)*` | `title`, `amount`, `media`, `assessment`, `feedback*` | `title + amount + situation + media + feedback*` |

## 5. Template `ObjectClassification`

> Pendiente de definición en la guía fuente.

## 6. Template `BudgetAdjustment`

> Pendiente de definición en la guía fuente.

## 7. Template `CollectObjects`

> Pendiente de definición en la guía fuente.

## 8. Template `WhatWouldYouDo`

> Pendiente de definición en la guía fuente.

---

# Construcción de vistas

Toda vista debe documentarse mediante un contrato mínimo. Este contrato sirve para diseño, implementación y revisión.

| Campo | Descripción |
|---|---|
| Misión | Nombre o código de la misión |
| viewId | Identificador único de la vista |
| Orden | Posición dentro de la misión |
| Tipo | `informativa` / `interactiva` / `evaluación` |
| Objetivo pedagógico | Qué busca lograr la vista |
| Template | Template de vista principal |
| Variante | Variante del template |
| Slots usados | Áreas que se completarán en la vista |
| Elementos | Base, compuestos e interactivos utilizados |
| Navegación | Si empieza, avanza, retrocede o finaliza |
| Criterio de completitud | Condición de cierre si aplica interacción |
| Notas de implementación | Observaciones técnicas o visuales |

---

# Checklist de validación de vista

| Validación | Sí / No |
|---|---|
| Tiene `viewId` único | |
| Tiene objetivo claro | |
| Tiene template definido | |
| Tiene variante definida | |
| Usa slots válidos | |
| Respeta la jerarquía tipográfica | |
| Respeta límites de contenido | |
| Tiene navegación definida | |
| Tiene criterio de completitud si aplica | |
| Se puede traducir a JSON sin ambigüedad | |

---

# Observaciones para uso en proyecto

- Este archivo está convertido a Markdown para lectura rápida en repositorio y para consumo por herramientas como Codex.
- Se normalizaron pequeños errores de digitación del PDF original para que la guía quede más clara.
- Las secciones de `ObjectClassification`, `BudgetAdjustment`, `CollectObjects` y `WhatWouldYouDo` permanecen vacías porque en la guía fuente todavía no estaban desarrolladas.
