# Template Catalog

Este catalogo organiza `templates` por tipo de experiencia.

## 1. `teoria`

Uso:
- pantallas expositivas
- contenido conceptual
- sin logica compleja

Variantes:
- `simple`
  Texto principal en una sola columna.
- `definitionWithMedia`
  Titulo + texto + media o imagen de apoyo.
- `definitionWithExamples`
  Titulo + texto + galeria de ejemplos.
- `definitionWithCompare`
  Titulo + texto + comparacion entre items.

## 2. `choiceReveal`

Uso:
- el usuario elige una opcion
- la misma vista revela un cambio o feedback
- sirve para preguntas conceptuales ligeras

Variantes:
- `binaryChoice`
  Dos opciones principales.
- `gridChoice`
  Varias opciones en grilla.
- `labelChoice`
  Opciones mas compactas o centradas en texto.

## 3. `stepGuide`

Uso:
- lista de pasos
- cada paso abre un detalle
- el detalle puede aparecer en modal o inline

Variantes:
- `modalDetail`
  El detalle se abre en modal.
- `inlineDetail`
  El detalle aparece dentro de la misma vista.

## 4. `scenarioExplorer`

Uso:
- una sola vista cambia segun el input del usuario
- ideal para ejemplos, simulaciones y tablas dinamicas

Variantes:
- `numericOutcome`
  El resultado cambia con un numero ingresado.
- `rangeOutcome`
  El resultado cambia con un rango o slider.
- `weeklyBudget`
  Caso de presupuesto semanal.

## 5. `memoryGame`

Uso:
- juego de pares
- emparejamiento visual o texto-imagen

Variantes:
- `imagePairs`
  Emparejamiento visual.
- `textImagePairs`
  Emparejamiento texto con imagen.

## Regla De Escalabilidad

- Si cambia solo la distribucion visual: nueva `variant`
- Si cambia el comportamiento de la pantalla: nuevo `template`
- Si cambia solo una pieza interna: nuevo `block`

## Estado Actual

Templates ya expuestos en el sistema:
- `teoria`
- `choiceReveal`
- `stepGuide`
- `scenarioExplorer`
- `memoryGame`

Templates legacy que todavia existen por compatibilidad:
- `memoryPairs`
