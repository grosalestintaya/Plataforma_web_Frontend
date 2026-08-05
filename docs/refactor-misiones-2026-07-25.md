# Registro de reorganización de misiones

Fecha: 25 de julio de 2026

Este archivo registra las decisiones, correcciones y cambios realizados desde que se empezó a modificar hoy la arquitectura de las vistas de misión. Su propósito es servir como retroalimentación técnica y como guía para continuar la migración sin perder el contexto.

## Regla de trabajo: registrar primero cómo estaba

Antes de reemplazar un componente se debe dejar por escrito su contrato anterior. No es suficiente comparar únicamente su apariencia estática. Como mínimo se debe registrar:

- qué información mostraba;
- qué ocurría al hacer clic;
- qué ocurría al hacer hover y al recibir foco con teclado;
- cómo indicaba selección, error, avance o finalización;
- a qué panel se trasladaba o qué estado modificaba;
- qué elementos aparecían o desaparecían;
- qué reglas del juego dependían de esa interacción;
- cuál era su distribución visual y sus estados vacío, bloqueado y completado.

Después del cambio se debe comprobar cada uno de esos puntos. Reutilizar un bloque no autoriza a aceptar su comportamiento predeterminado si es diferente del contrato anterior.

### Fuentes para reconstruir el estado anterior

En este orden:

1. Capturas o grabaciones entregadas como referencia.
2. Comportamiento observado en la versión anterior.
3. Implementación anterior consultada mediante Git.
4. JSON de contenido y reglas del hook o juego.
5. Comentarios y retroalimentación funcional del usuario.

## Línea base funcional antes de la migración

### Módulo 3: ajuste de presupuesto

Antes de sustituir su superficie:

- Las tarjetas disponibles mostraban la imagen y el precio.
- El nombre permanecía oculto y aparecía al hacer hover o al navegar con foco.
- La tarjeta no se abría con zoom.
- Al hacer clic, la tarjeta se seleccionaba y dejaba la cuadrícula disponible.
- La selección se agregaba al conjunto de `Gastos` y actualizaba la balanza, el total y el saldo.
- Al abrir el conjunto de gastos, hacer clic sobre una tarjeta la retiraba y la devolvía a las opciones disponibles.
- El botón de revisión evaluaba gastos esenciales, alternativas obligatorias, exclusiones y saldo.
- La tarjeta de ingreso permanecía en el lado de `Ingresos`.

La implementación anterior de `BudgetProductCard` usaba directamente `CardBase` y añadía un botón transparente sobre toda la tarjeta. Por ello, aunque tuviera imagen, no activaba automáticamente una interacción de zoom.

### Módulo 4: recolección de objetos

Antes de sustituir paneles:

- El jugador movía una canasta y atrapaba objetos que caían.
- Ingresos y gastos alteraban de forma diferente el monto recolectado.
- La meta, el valor recolectado y la barra de progreso se actualizaban durante el juego.
- Hacer clic en el panel recolectado abría el detalle de movimientos.
- Inicio, pausa, derrota y victoria tenían overlays independientes.
- En el modo de excedente, las oportunidades eran seleccionables y mostraban visualmente la elegida.

`FallingCard`, `Basket`, colisiones, ondas y cálculo semanal forman parte del contrato del juego y no deben convertirse en simples paneles visuales.

### Módulo 5: qué harías

Antes de sustituir paneles:

- El aside cambiaba su información según el paso actual.
- La selección de materiales actualizaba el dinero necesario.
- Las ofertas se podían abrir, comparar y seleccionar.
- La estrategia de pago condicionaba los pasos y cálculos semanales.
- Los mensajes de advertencia o éxito dependían de las decisiones tomadas.
- El cierre mostraba el resultado financiero y la calidad del pago.

El aside no era contenido estático: era una representación del estado del juego. Su nueva composición debe seguir consumiendo `interactiveAsideModel` y no duplicar esas reglas.

## Objetivo acordado

La meta no es crear un layout o un bloque distinto para cada misión procedimental. La estructura acordada es:

- `MissionViewTemplate` es la plantilla general de las vistas de una misión.
- Las disposiciones visuales se definen mediante configuraciones de layout de esa plantilla.
- `lobby`, `theory`, `quiz` y las vistas procedimentales pasan por la misma plantilla general.
- `game/` conserva la lógica, las reglas y el estado particular de cada juego.
- Los paneles visuales internos se construyen reutilizando bloques existentes como `Card`, `Modal`, `ComposeGroup`, `ProgressBar`, `Typography`, `Button`, `CollageCard`, `Shopping` y otros.
- No se agregan bloques exclusivos para una sola misión.

## Retroalimentación recibida y correcciones

### 1. El layout no debía vivir en `layouts/ProceduralMissionLayout`

Se descartó esa propuesta. La responsabilidad quedó dentro de la plantilla general y su configuración, no en un layout exclusivo para las misiones procedimentales.

### 2. `TheoryTemplate` era un nombre demasiado específico

Se creó `MissionViewTemplate` como nombre y punto de entrada general. Las carpetas `theory`, `quiz` y `lobby` fueron eliminadas posteriormente: sus runtimes viven ahora dentro de `views/general`, y sus variantes se resuelven como layouts o controllers internos de la plantilla general.

### 3. Lobby y quiz también debían utilizar la plantilla general

Quiz y lobby utilizan `MissionViewTemplate`. El lobby conserva su presentación anterior mediante `views/general/lobbyRuntime.jsx`, registrado como controller para respetar hooks y efectos sin mantener un template independiente.

### 4. No se debían crear bloques para resolver una sola misión

Se dejó de ampliar `blocks/` con conceptos específicos de juegos. En esta etapa solo se ampliaron capacidades generales de bloques que ya existían.

### 5. Los módulos procedimentales debían migrarse gradualmente

Se añadió el layout de compatibilidad `fullStage`. Este permite que una misión pase primero por `MissionViewTemplate` conservando su escenario completo y que después se reemplacen sus paneles internos por bloques compartidos, uno por uno.

## Cambios de arquitectura realizados

### `MissionViewTemplate`

Se agregó:

- `views/mission/MissionViewTemplate.jsx`
- `views/mission/missionView.registry.js`
- `views/mission/missionView.layouts.js`
- `views/general/`

La plantilla resuelve dos formas de uso:

1. Runtime declarativo con layout y slots.
2. Contenido existente recibido como `children`, adaptado mediante `fullStage`.

Esto evita reescribir de una sola vez la lógica de un juego grande.

### Renderizado de slots

La interpretación de slots quedó integrada en `MissionViewTemplate`. Antes se delegaba a `SlotRenderer`, pero ese archivo no tenía ningún otro consumidor. `MissionViewTemplate` conserva el soporte para `render`, condiciones, grupos, layouts internos, bloques anidados y `children`, sin mantener una abstracción separada de uso único.

### Theory y quiz

- Ya no existen `TheoryTemplate` ni `QuizTemplate` como wrappers.
- Sus runtimes quedaron dentro de `views/mission`.
- Sus configuraciones entregan las clases de área y cuadrícula a la plantilla general.
- El registro apunta las variantes correspondientes al `MissionViewTemplate`.

### Cinco módulos procedimentales

Los cinco templates procedimentales pasan por `MissionViewTemplate`:

- Módulo 1: `MissionViewTemplate` mediante `game/dailySpending/dailySpending.runtime.js`.
- Módulo 2: `MissionViewTemplate` mediante `game/objectClassification/objectClassification.runtime.js`.
- Módulo 3: `MissionViewTemplate` mediante la definición registrada en `game/budgetAdjustment/budgetAdjustment.runtime.jsx`.
- Módulo 4: `CollectObjectsTemplate`.
- Módulo 5: `WhatWouldYouDoTemplate`.

Los módulos 4–5 usan `fullStage` como puente mientras sus paneles internos se convierten gradualmente en composiciones. El módulo 3 ya entrega regiones declarativas a `MissionViewTemplate`.

## Capacidades generales añadidas a bloques existentes

No se creó ningún bloque nuevo.

### `Card` y `CardBase`

Ahora pueden:

- Recibir `children` para actuar como superficie de una composición.
- Cambiar el elemento semántico mediante `as`, por ejemplo `section` o `button`.
- Recibir propiedades de interacción y accesibilidad.
- Mantener overlays.
- Personalizar las clases del medio y de su imagen.

Esto permite retirar wrappers locales sin perder el diseño particular de una misión.

### `Modal`

Ahora puede:

- Mostrar contenido compuesto mediante `children`.
- Personalizar fondo, superficie, encabezado y área de contenido.
- Recibir un encabezado JSX o un contenido tipográfico.
- Configurar su etiqueta accesible.

La apertura y el cierre continúan controlados por la lógica del juego.

### `ProgressBar`

Además del progreso segmentado, admite el modo continuo con:

- `mode="continuous"`
- `value`
- `max`
- atributos ARIA de progreso
- clases independientes para pista y relleno

## Migración interna de módulos 3–5

### Módulo 3: ajuste de presupuesto

- El antiguo `BudgetAdjustmentTemplate.jsx`, que mezclaba reglas, estado y toda la superficie visual, fue retirado.
- `budgetAdjustment.config.js` contiene datos predeterminados, normalización y reglas puras de validación, puntuación y avance.
- `useBudgetAdjustmentController.js` contiene el estado React, la persistencia y los handlers del juego.
- `MissionViewTemplate` monta el controlador registrado como componente React y conserva el reinicio por vista.
- `budgetAdjustment.runtime.jsx` contiene ese pequeño límite React y transforma el estado del hook en regiones y bloques reutilizables.
- `getBudgetProductCardProps` es una función pura que produce las propiedades de `Card`; el runtime ya no declara otro componente React para las tarjetas del presupuesto.
- La interacción se declara explícitamente como `selectable` y se desactiva el zoom automático.
- El overlay anterior se conserva: insignia de precio, nombre revelado mediante hover o foco y área completa seleccionable.
- La selección continúa llamando a `toggleSelection`, por lo que la tarjeta pasa a `Gastos`; desde el modal de gastos, la misma acción permite retirarla.
- El panel de gastos seleccionados dejó de implementar por su cuenta toda la infraestructura modal y usa `Modal`.
- La cuadrícula de productos continúa usando `CollageCard`.
- La retroalimentación del personaje se organiza con `ComposeGroup` y `Typography`.
- `BalanceScale` se conserva porque contiene comportamiento y reglas propios de la actividad, no solo presentación.
- `BalanceScale` se exporta desde el diccionario público de bloques para que el runtime pueda solicitarlo por nombre.
- `MissionViewTemplate` admite ahora overlays declarativos; el modal de gastos se renderiza mediante esa capacidad general y no mediante una excepción del juego.
- El escenario usa el layout global `balanced`: el aside compuesto ocupa `heading`, el catálogo `primary` y la balanza `secondary`, sin layouts anidados exclusivos del juego.
- La selección, el cálculo del saldo, los grupos obligatorios, las exclusiones, las dos situaciones y el promedio final conservaron su contrato.

### Módulo 4: recolección de objetos

- Se eliminó el componente visual local `GoalCard`; la meta se representa con `Card`.
- La barra de avance hecha manualmente usa ahora `ProgressBar` en modo continuo.
- El detalle de movimientos y del excedente usa `Modal`.
- Las tarjetas de estadísticas y resumen de `SurplusDecisionStage` componen `Card`, `ComposeGroup` y `Typography`.
- Las oportunidades seleccionables usan `Card` como botón semántico.
- Se conservaron `FallingCard` y `Basket`, porque representan mecánicas y objetos propios del juego.
- La detección de colisiones, las ondas, las semanas, el excedente y la puntuación no se movieron.

### Módulo 5: qué harías

- En esta etapa intermedia, el aside dejó de depender de `InteractiveInfoAside`.
- El modelo de información del aside se transforma en configuración de `ComposeGroup`.
- Sus secciones usan `Card`, `Typography` y `Button`.
- `SidebarRow`, `SectionCard` e `InfoBanner` dejaron de dibujar superficies desde cero y funcionan como adaptadores de composición de bloques existentes.
- Las ofertas usan `Card` como botón interactivo.
- `Shopping` sigue resolviendo la selección de materiales.
- La lógica de crédito, pagos semanales, ventas y resultado final permanece en `useWhatWouldYouDoLogic`.

Esta descripción corresponde a una etapa intermedia. En la arquitectura vigente, el módulo 5 volvió a usar `InteractiveInfoAside` como agrupador declarativo de su información, sin trasladarle reglas del juego ni la construcción de bloques internos.

## Migración misión por misión

### Procedimental del módulo 1

#### Cómo estaba antes

La misión combina seis vistas:

1. Lobby de inicio.
2. Decisión para llegar al colegio.
3. Compra durante el recreo.
4. Decisión extra disponible cuando la compra incluye un producto compatible con la regla de la botella.
5. Decisión para regresar a casa.
6. Lobby de cierre y recompensas.

El contrato funcional de las vistas interactivas era:

- El saldo inicial se obtiene de la misión y se hereda desde el estado de la vista anterior.
- Las decisiones usan dos tarjetas seleccionables.
- Al seleccionar una decisión se actualizan saldo, costo, recompensa y puntaje.
- La retroalimentación de la opción aparece antes de continuar.
- No se puede avanzar sin seleccionar una opción.
- En el recreo se pueden seleccionar varios productos.
- Las tarjetas de productos son seleccionables y no deben abrirse con zoom.
- La calculadora muestra productos elegidos, total y saldo restante.
- Un producto puede retirarse desde la selección.
- No se permite agregar una compra que supere el saldo disponible.
- La confirmación persiste `selectedProductIds`, total, saldo y puntaje.
- La selección del recreo determina si se visita la situación extra o se continúa con la siguiente situación normal.

Estructuralmente, `DailySpendingTemplate.jsx` todavía cumplía tres responsabilidades:

- controlaba estado y reglas;
- construía el runtime visual;
- añadía el contenedor exterior antes de llamar a `MissionViewTemplate`.

Además, `dailySpending.config.js` mezclaba normalización y reglas del juego con layouts, slots y selección de bloques.

#### Cómo queda con la nueva estructura

Después de revisar la primera reorganización se descartó la carpeta `variants/`. Aunque separaba responsabilidades, añadía una vista y un hook exclusivos para una misión que ya puede construirse con bloques existentes.

La estructura final es:

```text
views/mission/
├── MissionViewTemplate.jsx
├── missionView.registry.js
└── missionView.layouts.js

views/general/
├── theoryRuntime.js
├── quizRuntime.js
└── lobbyRuntime.jsx

game/
└── dailySpending/
    ├── dailySpending.config.js
    └── dailySpending.runtime.js
```

Responsabilidades:

- `missionView.registry.js` relaciona cada nombre de template con su función de runtime o con un componente controlador cuando la misión necesita hooks.
- `MissionViewTemplate.jsx` consulta el registro y entrega el runtime a la plantilla general.
- `views/general/` contiene runtimes reutilizables del template general, incluido el controller de lobby.
- `game/shared/` contiene utilidades compartidas por controllers de juegos.
- `game/dailySpending/dailySpending.config.js` mantiene la normalización, el saldo heredado y las reglas puras del dominio.
- `game/dailySpending/dailySpending.runtime.js` contiene también sus layouts y clases particulares, compone `Card`, `ChooseOne` y `Shopping`, conecta resultados con `heroApi` y conserva la ramificación del flujo.
- Cada juego procedural nuevo tendrá su propia carpeta dentro de `game/` y, como base, sus dos archivos: `<juego>.config.js` para datos y reglas, y `<juego>.runtime.js` para layouts, composición visual y handlers.
- `MissionViewTemplate` admite `stageClassName`, renderiza la cuadrícula principal e interpreta directamente los slots declarativos.

El registro principal de templates apunta todas las variantes de Daily Spending directamente a `MissionViewTemplate`.

Se retiraron:

- `DailySpendingTemplate.jsx`;
- `DailySpendingMissionView.jsx`;
- `useDailySpendingLogic.js`;
- la carpeta `views/mission/variants/`;
- `SlotRenderer.jsx`, cuya lógica se integró en su único consumidor: `MissionViewTemplate`.

De esta manera no existe un template ni un controlador visual particular para el módulo 1.

#### Diccionario general

`missionView.registry.js` funciona como el diccionario de runtimes:

- los templates conceptuales resuelven `getTheoryRuntime`;
- los templates de quiz resuelven `getQuizRuntime`;
- los templates Daily Spending resuelven `getDailySpendingMissionRuntime`.

Todos terminan en el mismo `MissionViewTemplate` y utilizan el mismo diccionario público de bloques.

#### Pulido de Daily Spending para extensión futura

Se corrigió el contrato responsive general antes de reorganizar el juego:

- `normalizeLayout` conserva ahora `base`, `md`, `lg` y `fit`;
- `HeroGrid` aplica columnas, filas y áreas específicas de `lg`;
- `fit` continúa funcionando como compatibilidad y `lg` tiene prioridad cuando ambos existen;
- las disposiciones de escritorio declaradas por Daily Spending ya no son ignoradas.

Los dos archivos de Daily Spending mantienen responsabilidades separadas:

- `dailySpending.config.js` produce `getDailySpendingModel`, normaliza contenido moderno y legacy, calcula saldos, persiste resultados y resuelve ramificaciones mediante cualquier `stateKey`;
- `dailySpending.runtime.js` contiene layouts, slots, handlers y el registro `DAILY_SPENDING_VARIANTS`.

El registro declara explícitamente `decision`, `event`, `shop` y `assessment`. Cada entrada relaciona:

- layout exterior;
- composición de slots;
- fábrica de handlers;
- fábrica del payload particular.

Se retiraron el ternario cerrado de variantes y el condicional global `isShop`. Las variantes reconocidas tienen una entrada explícita y solamente una variante desconocida utiliza el fallback controlado `decision`. La variante exterior compartida utiliza un único layout `stage`, mientras los layouts internos siguen siendo particulares de decisión y evento.

Para agregar una variante futura se incorpora su normalizador en `VARIANT_MODEL_BUILDERS` y su composición en `DAILY_SPENDING_VARIANTS`. Los hooks continúan dentro de los bloques React; los registros solamente ejecutan funciones normales.

La ramificación dejó de depender internamente de `selectedProductIds`. `resolveDailySpendingNextViewId` recibe el estado resultante y evalúa el `stateKey` declarado en el documento, conservando el comportamiento actual de la tienda y permitiendo otros resultados en casos futuros.

#### Módulo 2: Object Classification

Antes, `ObjectClassificationTemplate.jsx` construía manualmente la cabecera, la imagen y el contenedor de clasificación, y luego introducía todo el escenario como `children` de `MissionViewTemplate`.

Ahora la carpeta del juego sigue el mismo contrato que Daily Spending:

```text
game/objectClassification/
├── objectClassification.config.js
└── objectClassification.runtime.js
```

- `objectClassification.config.js` localiza y normaliza la configuración, el título, la evaluación y la imagen.
- `objectClassification.runtime.js` declara sus layouts, clases propias y la composición de `Typography`, `Card` y `ClasifyCard`.
- `objectClassification` y `ObjectClassification` apuntan directamente a `MissionViewTemplate`.
- `ObjectClassificationTemplate.jsx` fue retirado.
- `ClasifyCard` conserva los hooks, las ubicaciones de objetos, drag-and-drop, selección por clic, persistencia, puntuación y avance. El runtime no invoca hooks dinámicamente.
- El soporte genérico `gridClassName` para layouts internos se incorporó a `MissionViewTemplate`, de modo que cada juego controla la disposición de sus slots sin introducir estilos específicos en la plantilla general.

#### Módulo 3: Budget Adjustment

##### Cómo estaba antes

`BudgetAdjustmentTemplate.jsx` era un archivo monolítico: normalizaba contenido, evaluaba las reglas, administraba el estado y la persistencia, construía los paneles y finalmente introducía el escenario completo en `MissionViewTemplate` mediante compatibilidad `fullStage`.

Su contrato funcional era:

- cada situación mostraba un ingreso y un catálogo de gastos;
- una tarjeta disponible revelaba su nombre mediante hover o foco;
- la tarjeta era seleccionable y no abría zoom;
- al seleccionarla desaparecía del catálogo y se agregaba a `Gastos`;
- el total, el saldo, la balanza y la retroalimentación cambiaban inmediatamente;
- el modal de `Gastos` permitía retirar tarjetas y devolverlas al catálogo;
- la revisión comprobaba esenciales, grupos obligatorios, máximos por grupo, exclusiones y saldo mínimo;
- una revisión aprobada permitía avanzar a la segunda situación o finalizar;
- la calificación final era el promedio de ambas situaciones y se persistía mediante `heroApi`.

##### Cómo queda

```text
game/budgetAdjustment/
├── budgetAdjustment.config.js
├── budgetAdjustment.runtime.jsx
└── useBudgetAdjustmentController.js
```

- `budgetAdjustment.config.js` entiende los datos y expone reglas puras, comprobables sin renderizar React.
- `useBudgetAdjustmentController.js` administra el estado, los cambios de situación, la revisión, la finalización y la persistencia.
- `budgetAdjustment.runtime.jsx` compone `Card`, `CollageCard`, `ComposeGroup`, `BalanceScale`, `Modal` y los layouts globales. También exporta el límite React de la misión, que invoca el hook como parte de un componente y entrega el runtime resultante al renderer general.
- El registro principal de templates apunta `budgetAdjustment` a `MissionViewTemplate`, igual que los demás módulos migrados. El registro interno de MissionView distingue entre `createRuntime` para composiciones puras y `Controller` para misiones con hooks.
- `MissionViewTemplate` monta `Controller` mediante JSX; nunca lo invoca como una función ordinaria. Así se respetan las reglas de hooks sin introducir reglas de presupuesto en la plantilla global.
- El template monolítico fue eliminado y el módulo ya no usa `fullStage`.
- Las regiones globales son `heading`, `primary`, `secondary` y overlays opcionales. Una región ausente no reserva espacio.

Las dos situaciones reales del JSON se comprobaron con selecciones mínimas válidas. `refrescos-naturales` produjo total `S/46`, saldo `S/34`, estado `good` y cero incidencias; `macetas-recicladas` produjo total `S/69`, saldo `S/21`, estado `good` y cero incidencias.

##### Segunda simplificación de Budget Adjustment

Después de separar responsabilidades se revisó también el volumen de código. La primera versión organizada tenía 1137 líneas propias del juego, frente a aproximadamente 1056 del template monolítico anterior. Por tanto, inicialmente había mejor arquitectura, pero no menor complejidad.

Se aplicaron estas correcciones:

- `evaluateBudget` reemplaza los recorridos separados de estado, incidencias y feedback. Una única evaluación produce tarjetas seleccionadas y disponibles, total, saldo, esenciales faltantes, problemas de grupos, estado, puntaje y mensaje.
- Los siete estados React relacionados se sustituyeron por un único `useReducer` con eventos explícitos: `toggleItem`, `review`, `adjust`, `nextSituation` y `finalize`.
- Cambiar una selección invalida la revisión y finalización dentro del reducer; ya no existe un efecto dedicado a sincronizar esos estados.
- Se retiró `startTransition`, porque seleccionar una tarjeta en un catálogo pequeño es una actualización inmediata y económica.
- Los numerosos `useMemo` pequeños se redujeron a tres cálculos que sí producen objetos relevantes: el modelo normalizado, la evaluación completa y el snapshot persistido.
- `useMissionStatePersistence.js` centraliza la escritura controlada mediante `heroApi`. Es infraestructura general y no contiene reglas de Budget Adjustment.
- El estado inicial se restaura mediante el inicializador de `useReducer`, evitando que un efecto de persistencia pueda escribir el estado vacío antes de terminar la restauración.
- `MissionViewTemplate` monta el controlador registrado con una clave derivada de `id`, `viewId` o `template`, de modo que el reducer se reinicializa correctamente cuando cambia la vista.
- Se retiraron del código los productos de ejemplo duplicados; las tarjetas y situaciones proceden del JSON. Solo permanecen textos y valores mínimos de respaldo.
- Las decoraciones `badge` y `revealLabel` se expresan dentro de la configuración `interaction`. `revealLabel.mode="hoverFocus"` conserva la aparición del nombre con mouse o teclado, mientras la capa seleccionable sigue ocupando toda la tarjeta.
- Se eliminaron el mapa de iconos y el overlay manual de `BudgetProductCard`. Las imágenes continúan viniendo del contenido y la misión no crea un bloque nuevo.
- La cabecera, el personaje y el modal se expresan directamente como configuraciones de `ComposeGroup` y `CollageCard`, sin componentes adaptadores innecesarios.

El código propio de `game/budgetAdjustment` quedó en 838 líneas: 347 de datos, reglas, reducer y serialización; 368 del runtime visual y su pequeño límite React; y 123 del controlador de estado. La reducción frente a las 1137 líneas de la primera versión organizada es de 299 líneas, aproximadamente 26 %, sin contar el pequeño hook de persistencia compartido. Las tres representaciones de tarjetas permanecen explícitas como configuración declarativa y la apariencia específica se agrupa con nombres semánticos. Se priorizó que el runtime pueda auditarse y modificarse sin buscar utilidades dispersas; no se ocultó la misma cantidad de estilo en abstracciones genéricas que no corresponden al resto de misiones.

Además del camino aprobado, `evaluateBudget` se comprobó en estados `idle`, `process`, `good`, `risk` por incompatibilidad y `risk` por exceso de presupuesto. El flujo completo produjo dos resultados, promedio 100 y `completed: true`.

##### Centralización del controlador en MissionView

Se retiró `BudgetAdjustmentController.jsx` porque era un template intermediario de una sola misión. Su eliminación no significa que el hook se invoque dinámicamente desde un diccionario:

- `templates/index.js` registra tanto `budgetAdjustment` como `BudgetAdjustment` con `MissionViewTemplate`.
- `missionView.registry.js` almacena definiciones uniformes. Una definición puede proporcionar `createRuntime` o un componente `Controller`.
- `MissionViewTemplate` actúa como entrada y controlador general: si existe un `Controller`, lo monta con JSX y le entrega `renderRuntime` para reutilizar el renderer de slots, layouts y overlays.
- `BudgetAdjustmentMissionController`, definido junto al runtime del juego, invoca `useBudgetAdjustmentController` en un componente React y devuelve el runtime mediante `renderRuntime`.
- La configuración, el reducer y las reglas de Budget Adjustment continúan fuera de MissionView. La plantilla global solo conoce el contrato general de una definición controlada.
- La clave de montaje pasó del wrapper eliminado a `MissionViewTemplate`, conservando el reinicio de estado al cambiar de vista.

##### Render props declarativos

El runtime todavía importaba `Card` y `CollageCard` directamente porque `CollageCard.renderItem` y `BalanceScale.renderStackItem` esperaban callbacks que devolvieran JSX. Se eliminó ese acoplamiento mediante una capacidad general de `MissionViewTemplate`:

- Un slot puede declarar un diccionario `renderProps`. Cada clave corresponde al nombre de un render prop del bloque, por ejemplo `renderItem` o `renderStackItem`.
- El valor es otra definición normal de slot con `block`, `props`, condiciones, hijos o composición anidada.
- Cuando el bloque ejecuta el callback, `MissionViewTemplate` vuelve a resolver esa definición desde el diccionario público `Blocks` y expone los argumentos en `context.renderProp`.
- El contrato no conoce `CollageCard`, `BalanceScale` ni Budget Adjustment; puede utilizarse con cualquier bloque que acepte un render prop.
- El catálogo disponible, las tarjetas de la balanza y las tarjetas del modal ahora declaran `block: "Card"` dentro de `renderProps`.
- `budgetAdjustment.runtime.jsx` dejó de importar `Card` y `CollageCard`. `getBudgetProductCardProps` conserva en una sola función la media, las interacciones, accesibilidad y clases de cada tarjeta.
- `AvailableBudgetBoard` y `BudgetProductCard` fueron retirados como componentes privados. El estado vacío y el catálogo se expresan mediante slots condicionales.

##### Aside de cabecera y cierre visible del modal

Se corrigió la composición visual de Budget Adjustment a partir de la referencia anterior de la misión:

- La información que antes estaba repartida entre las dos columnas superiores ahora es un único `InteractiveInfoAside` situado en la región global `heading` del layout `balanced`.
- La variante general `heading` del aside crea exactamente dos columnas iguales (`1fr 1fr`) y una sola fila desde `md`. En pantallas estrechas las columnas se apilan para no reducir el contenido hasta volverlo ilegible.
- La primera columna contiene el nombre del proyecto y la instrucción, apilados con el mismo crecimiento vertical. La segunda contiene el avatar y su diálogo en una composición horizontal.
- Ambas columnas comparten el alto acotado de la cabecera y aplican `min-w-0`, `min-h-0` y `overflow-hidden`; ninguna puede ensanchar o alargar el aside por encima del espacio asignado.
- En ese momento `InteractiveInfoAside` todavía admitía el contrato histórico de `title` y `sections`. Ese contrato se retiró posteriormente: el bloque vigente solo recibe `children` y funciona como agrupador.
- El catálogo ocupa directamente `primary` y la balanza ocupa `secondary`; se retiraron los layouts anidados que solo servían para ubicar esos dos contenidos.
- El cierre de `Modal` ahora usa un ícono `X`, conserva el texto accesible `Cerrar` y tiene tamaño fijo. Además, el título está dentro de una región `min-w-0 flex-1`, por lo que una composición con `w-full shrink-0` ya no puede empujar el botón fuera del borde derecho.

La estructura se verificó mediante renderizado SSR: el documento resultante contiene el aside, las dos columnas iguales, una fila compartida, los dos textos solicitados, el diálogo del avatar y el botón accesible con su SVG de cierre.

##### Auditoría de Tailwind y responsabilidades de bloques

Se comparó cada clase del runtime con la implementación real de los bloques utilizados. El resultado no fue trasladar todas las utilidades fuera del juego: se eliminaron las que repetían responsabilidades existentes y se conservaron los overrides necesarios para reproducir su identidad visual.

| Bloque                  | Lo que ya proporciona                                                            | Repetición corregida                                                                                                                                                                 | Configuración que permanece en la misión                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `Card` / `CardBase`     | Geometría base, ancho, límites, radio, padding, media y superficie por variante  | Se retiraron `min-h-0`, `cursor-pointer` y un `contentClassName` que no se utilizaba en tarjetas solo con imagen. `size` fue retirado de `CardBase` porque no producía ningún estilo | Altura completa, overflow para insignias, borde, fondo, sombra y tamaños responsive propios de las tarjetas del presupuesto |
| `SelectableCard`        | Botón superpuesto, cursor, foco de teclado, `aria-pressed` y evento de selección | El runtime dejó de volver a declarar `cursor-pointer`                                                                                                                                | El runtime solo declara que la interacción es `selectable` y entrega el handler del juego                                   |
| `CollageCard`           | Grid, columnas, filas, wrappers, slots vacíos y Card de respaldo                 | No se duplicó su estructura ni se creó otra cuadrícula privada                                                                                                                       | Se mantienen tres filas compactas, doce espacios, gaps reducidos y el aspecto visual del catálogo                           |
| `ComposeGroup`          | Flex, dirección, gap, crecimiento y contracción de elementos                     | `shrink-0` se reemplazó por la propiedad existente `shrink: false`                                                                                                                   | Solo permanece el ancho responsive particular de la tarjeta del personaje                                                   |
| `Modal`                 | Backdrop, diálogo accesible, encabezado, cierre y superficie base                | Ahora usa `cn`; el ancho, fondo, borde y texto específicos reemplazan las clases base en vez de coexistir con ellas                                                                  | Altura máxima, scroll interno y tema naranja del modal de gastos                                                            |
| `BalanceScale`          | Toda la balanza, métricas, estados, botón, inclinación y distribución interna    | El runtime no le agrega clases Tailwind ni reconstruye sus paneles                                                                                                                   | Solo entrega datos, handlers, icono de estado y la definición declarativa de sus Cards                                      |
| `HeroGrid` / `HeroArea` | Grid responsive, regiones, tamaño disponible, overflow y centrado por defecto    | Se retiraron `relative`, `flex` y `flex-col` sin consumidores. `items-stretch` se sustituyó por `areaAlign: "stretch"`                                                               | Permanecen overrides de padding y gap porque el juego necesita un escenario compacto y los valores base son distintos       |

Las Cards totalmente tematizadas usan ahora la variante general `bare`. Esta variante conserva la geometría de `CardBase`, pero no agrega fondo ni borde de `default`, `ghost` o `solid`; evita que dos superficies visuales compitan entre sí.

Las clases que sí pertenecen a Budget Adjustment se concentran en `BUDGET_PRESENTATION`, agrupadas como escenario, grids, catálogo, producto, personaje, retroalimentación y modal. La composición de slots dejó de contener cadenas visuales dispersas.

##### Corrección de responsabilidad de Card

La primera simplificación colocó `badge` y `revealLabel` directamente en `Card`. Se corrigió porque no respetaba la arquitectura interna existente:

- `Card` funciona como único controlador: consulta `cardInteractionRegistry`, genera las mejoras y decide entre la interacción primaria o `CardBase`.
- `CardBase` continúa siendo la superficie sin comportamiento.
- `SelectableCard`, `ZoomableCard`, `DragDropCard` y `FlipCard` continúan siendo responsables de su acción y aceptan las mejoras visuales entregadas por `Card`.
- `badge` y `reveal` siguen siendo mejoras declarativas independientes, pero ambas se generan mediante `CardDecorationInteraction`. Este componente centraliza las clases base, selecciona la disposición a partir de `interaction.type` y no renderiza otro `CardBase`.
- Se retiraron `RevealCard` y `CardInteractionDecorations`; sus responsabilidades quedan expresadas por `Card`, `CardDecorationInteraction` y las mejoras registradas.
- También se retiraron los archivos separados `BadgeInteraction.jsx` y `RevealInteraction.jsx`. Para agregar una decoración futura se amplía el diccionario de `CardDecorationInteraction` y se registra el nuevo tipo apuntando al mismo componente.
- Se retiró `CardInteractionComposer.jsx` porque repetía la decisión que corresponde a `Card`. `resolveCardInteractions` es ahora una función pura del registro: normaliza el contrato y devuelve `primary`, `enhancers`, `hostProps` e incompatibilidades, pero no renderiza componentes.

##### Composición de dos o más interacciones

`interaction` admite tanto el objeto histórico como un arreglo. El registro clasifica cada entrada en una de dos categorías:

- `primary`: `selectable`, `zoomable`, `flipCard` y `dragDrop`;
- `enhancer`: `badge` y `reveal`.

Una tarjeta puede tener como máximo una interacción primaria y cualquier cantidad de mejoras. Esto evita superponer dos botones que compitan por el mismo clic. En desarrollo, si se declaran dos primarias, se utiliza la primera y se informa cuáles fueron ignoradas.

El contrato de uso queda así:

```jsx
<Card
  interaction={[
    { type: "selectable" },
    { type: "badge", content: "S/30" },
    {
      type: "reveal",
      content: "Frutas e insumos",
      mode: "hoverFocus",
    },
  ]}
/>
```

Combinaciones admitidas:

- `selectable + badge + reveal`;
- `zoomable + badge + reveal`;
- `dragDrop + badge`;
- `flipCard + reveal`;
- `badge + reveal`, sin acción primaria.

Los objetos singulares existentes, por ejemplo `interaction={{ type: "selectable" }}`, continúan funcionando. También se normaliza temporalmente el contrato intermedio que llevaba `badge` y `revealLabel` dentro de una interacción primaria. Esto permite migrar consumidores de forma gradual.

Budget Adjustment ya utiliza el arreglo explícito. Sus tarjetas disponibles declaran `selectable + badge + reveal`; la tarjeta de ingreso utiliza `badge + reveal` sin selección.

El resolvedor se comprobó con cinco contratos: objeto singular legacy, composición de tres interacciones, dos mejoras sin primaria, conflicto entre dos primarias y zoom automático por presencia de imagen. Los resultados conservaron la primaria correcta, todas las mejoras compatibles y registraron `zoomable` como ignorada en el caso conflictivo.

#### Cambio general en Shopping

`Shopping` puede utilizarse ahora de dos maneras:

- controlada, recibiendo `selectedIds`, totales y handlers desde un juego complejo;
- autónoma, administrando selección, total, saldo y error dentro del propio bloque.

El modo controlado conserva compatibilidad con el módulo 5. El modo autónomo permite que el módulo 1 no necesite un hook o controlador exclusivo.

En modo autónomo:

- normaliza las tarjetas como seleccionables y desactiva su zoom;
- calcula productos seleccionados, total y saldo;
- impide selecciones que superen el presupuesto cuando `enforceBalance` está activo;
- reporta cada cambio mediante `onSelectionChange`;
- entrega un payload completo al confirmar;
- reinicia su estado cuando cambia `resetKey`.

#### Bloques reutilizados

- `Card` para situación y saldo.
- `ChooseOne` para decisiones seleccionables y retroalimentación.
- `Shopping` para la compra del recreo.
- `CollageCard`, `Calculator` y `SelectableCard` a través de `Shopping`.

No se creó ningún bloque específico para el módulo 1.

#### Comportamientos que deben permanecer

- Seleccionar una decisión actualiza el saldo y muestra su retroalimentación.
- El botón continuar permanece desactivado hasta tener una selección.
- Elegir o retirar productos actualiza total y saldo.
- Una compra superior al saldo muestra el mensaje de insuficiencia y no cambia la selección.
- Confirmar la compra mantiene la ramificación condicional hacia la situación extra.
- Las tarjetas de productos continúan siendo seleccionables y tienen `zoomable: false`.
- El estado se reinicia al cambiar de vista, no durante una interacción dentro de la misma vista.
- El procedimiento se renderiza directamente mediante `MissionViewTemplate`.

#### Alcance deliberadamente no modificado

Los lobbies inicial y final conservan su implementación visual restaurada. No se modificaron en esta etapa porque su migración anterior produjo una regresión visual. Forman parte del flujo del procedimental, pero se migrarán solamente cuando la nueva composición reproduzca primero su línea base exacta.

## Regresión detectada y corrección

Durante la primera migración de `BudgetProductCard`, cambiar de `CardBase` a `Card` activó accidentalmente `ZoomableCard`. `Card` aplica zoom por defecto cuando recibe una imagen y no se declara otra interacción.

La regresión afectó el contrato anterior:

- el clic intentaba abrir la imagen;
- la tarjeta dejaba de comportarse como una opción de gasto;
- se ponía en riesgo el paso de la tarjeta hacia `Gastos`;
- el comportamiento de hover del rótulo ya no era el criterio principal de interacción.

Corrección aplicada:

- `BudgetProductCard` usa `interaction={{ type: "selectable" }}`;
- `zoomable={false}` queda declarado para impedir una resolución automática incorrecta;
- `onSelect` recibe la acción original de selección o retiro;
- `SelectableCard` admite el overlay y las clases visuales de la composición;
- el evento de selección se reenvía para conservar casos que necesitan detener su propagación;
- el nombre continúa apareciendo con `group-hover` y `group-focus-within`.

Esta incidencia originó la regla de documentar la línea base funcional antes de cada refactorización.

## Qué se conserva deliberadamente dentro de `game/`

No todo debe convertirse en un bloque genérico. Permanecen dentro de cada juego:

- reglas de negocio;
- estado y transiciones;
- detección de colisiones;
- generación de objetos;
- fórmulas y puntuación;
- validaciones específicas;
- adaptadores pequeños que convierten datos del juego en propiedades de bloques.

La frontera aplicada es: comportamiento específico en `game/`, presentación repetible en `blocks/`, disposición general en `MissionViewTemplate`.

## Centralización global de layouts de misión

### Línea base antes del cambio

Antes de esta etapa, cada familia migrada seguía entregando un `layoutDef` completo:

- Theory mantenía layouts `simple`, `explanation`, `split` y `assessment`, además de funciones para insertar y retirar filas según el payload.
- Quiz mantenía dos layouts idénticos para `simple` y `extended`.
- Daily Spending mantenía `stage`, `header`, `decision.simple`, `decision.withMedia` y `event` dentro de `dailySpending.runtime.js`.
- Object Classification mantenía `stage`, `sidebar.simple` y `sidebar.withMedia` dentro de `objectClassification.runtime.js`.
- `fullStage` declaraba un área propia llamada `content`.

Aunque esas configuraciones funcionaban, repetían decisiones de distribución y obligaban a cada juego a conocer columnas, filas y breakpoints.

### Nuevo contrato global

Se creó `views/mission/missionView.layouts.js` como única fuente para las disposiciones generales:

```text
focus
└── primary

guided
├── heading
├── support
├── primary
└── feedback

balanced
├── heading heading
├── support support
├── primary secondary
└── feedback feedback

primaryEmphasis
├── heading
└── primary

secondaryEmphasis
└── heading primary
```

`primary` es la única región obligatoria. `heading`, `support`, `secondary` y `feedback` son opcionales dependiendo del contrato del layout.

`resolveMissionLayout` evalúa los `when`, grupos y reservas de espacio antes de crear el grid. Las regiones ausentes se eliminan:

- `balanced` sin `secondary` expande `primary` sobre ambas columnas;
- `guided` sin `support` retira completamente esa fila;
- `primaryEmphasis` sin `heading` deja solamente `primary`;
- `secondaryEmphasis` sin `heading` se compacta a una columna;
- una reserva explícita mediante `reserveSpace` continúa contando como región activa.

Los registros son objetos estáticos fuera del render. No se crean componentes dinámicos ni se invocan hooks desde el diccionario.

### Migraciones realizadas

#### Theory

- `simple` usa `guided`.
- `explanation` usa `primaryEmphasis`.
- `split` usa `balanced`.
- `assessment` usa `primaryEmphasis`.
- Las antiguas áreas `title`, `body1`, `body2`, `media` y `assessment` se tradujeron a las regiones globales.
- Las dos composiciones de `split` se entregan directamente como `primary` y `secondary`; Theory ya no crea un grid interno exclusivo para esas columnas.
- Se retiraron las funciones particulares que insertaban o eliminaban filas.

#### Quiz actitudinal

- `simple` y `extended` conservan su comportamiento y compatibilidad.
- Ambos usan `focus`, porque `Form` es el contenido principal.
- La composición interna de pregunta, opciones, imagen y justificación sigue perteneciendo a `Form`; no se duplicó en el layout global.

#### Daily Spending

- Todas sus variantes (`decision`, `event`, `shop`, `assessment`) usan `primaryEmphasis` como escenario general.
- La cabecera usa `secondaryEmphasis`.
- Una decisión sin imagen usa `focus`; con imagen usa `balanced`.
- Un evento usa `secondaryEmphasis`.
- La tienda usa `focus`.
- Se retiró por completo `DAILY_SPENDING_LAYOUTS`.
- Las reglas, handlers, ramificaciones y persistencia siguen dentro de los archivos del juego.

#### Object Classification

- El escenario usa `secondaryEmphasis`: información en `heading` e interacción en `primary`.
- La composición informativa interna usa `guided`.
- Se retiró por completo `OBJECT_CLASSIFICATION_LAYOUTS`.
- `ClasifyCard` conserva sin cambios su lógica interactiva.

#### Compatibilidad

- `MissionViewTemplate` sigue aceptando temporalmente `layoutDef` para consumidores aún no migrados.
- Los runtimes nuevos deben entregar `layoutVariant`.
- Los slots anidados también pueden entregar `layoutVariant`, lo que permite reutilizar el mismo catálogo sin declarar grids dentro de los juegos.
- El runtime con `children` usa ahora `focus` y la región `primary`.

## Validación realizada

### Compilación

Comando:

```bash
node .\node_modules\vite\bin\vite.js build
```

Resultado más reciente: compilación de producción exitosa, con 2739 módulos transformados. La carga diferida mantiene el chunk de actividad en 423.25 kB minificado y 99.71 kB gzip. Budget Adjustment quedó en 15.59 kB, el controlador de What Would You Do en 25.43 kB, `LoanPlanning` en 16.03 kB y `CollectObjects` en 62.07 kB. Vite finalizó sin advertencias.

Las tres advertencias registradas anteriormente quedaron resueltas:

- ya no existe una clave `borderColor` duplicada;
- `LogOut.jsx` dejó de combinar imports estáticos y dinámicos;
- ningún chunk de actividad supera 500 kB y Vite finaliza sin advertencias.

### ESLint focalizado

Se ejecutó ESLint sobre `Card`, la persistencia compartida y los cuatro archivos de Budget Adjustment, además de las validaciones anteriores de `MissionViewTemplate`, layouts, Theory, Quiz, Daily Spending y Object Classification. Los archivos modificados finalizaron sin errores.

Adicionalmente se resolvieron los runtimes de las 62 vistas conceptuales y actitudinales actuales contra sus documentos JSON. Todas produjeron un layout global válido y conservaron una región `primary`. La prueba que exigía un `InteractiveInfoAside` en las 39 vistas conceptuales perteneció a una etapa intermedia y quedó reemplazada por la validación de alcance procedimental descrita más abajo.

### Revisión en navegador

- La aplicación local carga correctamente.
- La revisión autenticada se completó sobre las cinco misiones procedimentales en un viewport de `887 × 738`, además del ancho natural disponible durante el recorrido.
- Daily Spending conserva el lobby, las decisiones seleccionables, el saldo y el botón de continuación sin desbordamiento global.
- Object Classification conservaba sus ocho tarjetas, pero cuatro quedaban fuera del área visible. Se añadió scroll vertical únicamente al banco de objetos; se comprobó desplazándolo hasta `Juguete`, sin hacer scroll al escenario completo.
- Budget Adjustment conserva la selección de tarjetas, el traslado a Gastos, el recálculo del saldo y el modal. El botón `X` quedó completamente visible y cerró el modal correctamente.
- Collect Objects conserva el panel informativo, la meta, el campo de juego, el botón de inicio y el juego activo sin controles recortados.
- What Would You Do mostraba el contenido completo en el DOM, pero un `CardBase` intermedio lo recortaba antes de llegar al contenedor con scroll. El primer paso ahora permite desplazar la región `primary` hasta los últimos materiales y el botón `Revisar materiales`.
- Los lobbies de los módulos 3 y 5 mostraban una barra horizontal con textos largos. El contenedor informativo ahora limita el eje horizontal, permite solo scroll vertical y adapta el tamaño del texto en anchos intermedios.
- Durante esta corrección también se movió `useEquippedAvatar` al nivel superior del controller de lobby; `getPayload` volvió a ser una función pura y ya no invoca hooks dinámicamente.

## Estado actual y próximos pasos

Los cinco módulos procedimentales usan `MissionViewTemplate` como entrada. Los módulos con estado local complejo se montan como controladores React registrados y entregan un runtime propio; los hooks no se invocan desde el diccionario. `fullStage` quedó sin consumidores y se retiraron tanto su rama de compatibilidad como `missionView.config.js`.

### Correcciones completadas para InteractiveInfoAside — 2026-08-03

Las observaciones acordadas se resolvieron de la siguiente manera:

1. `InteractiveInfoAside` es ahora un agrupador puro: solo define la superficie, las variantes `default` y `heading`, los límites de overflow y el contenedor de `children`.
2. Se retiraron sus imports de `Card`, `Typography` y `Button`, junto con `InfoCell`, `StatSection`, `CardsSection`, `MessageSection`, `ActionSection` y `AsideSection`.
3. Se eliminaron las propiedades históricas `title` y `sections`. La búsqueda previa confirmó que no quedaban consumidores externos; Budget Adjustment ya utilizaba composición mediante `children`.
4. El bloque continúa exportado desde el diccionario público de bloques, por lo que `MissionViewTemplate` lo resuelve por nombre.
5. Esta etapa incorporó temporalmente el agrupador en las cuatro variantes conceptuales. La decisión se revirtió posteriormente: Theory conserva la composición declarativa de sus bloques, pero ya no usa `InteractiveInfoAside`.
6. No se modificaron automáticamente las misiones actitudinales. Ese alcance permanece separado, tal como se acordó.

### Alcance definitivo de InteractiveInfoAside — 2026-08-03

`InteractiveInfoAside` queda reservado para las misiones procedimentales. No representa un tipo de contenido conceptual: representa la región informativa que acompaña a la interacción de un juego.

- Theory dejó de declarar `block: "InteractiveInfoAside"`. Sus variantes `simple`, `explanation`, `split` y `assessment` agrupan título y texto mediante slots nativos de `MissionViewTemplate`.
- Daily Spending usa la variante `heading` para agrupar en dos columnas iguales la situación y el saldo.
- Object Classification usa la variante `default` alrededor de su título, evaluación y apoyo visual.
- Budget Adjustment conserva la variante `heading` para su cabecera informativa.
- Collect Objects entrega su panel azul como hijo del agrupador. El elemento visual interno pasó de `aside` a `div`, evitando anidar dos elementos semánticos `aside`.
- What Would You Do conserva el agrupador alrededor de su `ComposeGroup` informativo.
- Los cinco runtimes procedimentales declaran el bloque por nombre. El agrupador no importa ni construye `Card`, `Typography`, `ComposeGroup` u otros bloques: cada juego decide qué hijos introduce.

### Migración de los módulos procedimentales 4 y 5 — 2026-08-03

- `CollectObjectsTemplate` y `WhatWouldYouDoTemplate` dejaron de importar o envolver contenido en `MissionViewTemplate`.
- Ambos se registran como componentes controladores. React monta esos componentes normalmente, por lo que sus hooks mantienen un orden estable.
- Cada juego tiene ahora `<juego>.config.js` con sus claves y contrato de runtime, y `<juego>.runtime.js` con su composición declarativa.
- `templates/index.js` dirige las cuatro claves de ambos juegos a `MissionViewTemplate`.
- Se retiró `createFullStageRuntime`; ya no existe una ruta alternativa basada en `children` dentro de la plantilla general.
- Los controladores de Budget Adjustment, Collect Objects y What Would You Do se cargan de forma diferida desde el registro para no incorporarlos todos al chunk inicial de actividad.
- Ambos juegos usan el layout global `secondaryEmphasis`, con una región informativa `heading` y una región de interacción `primary`.
- Collect Objects entrega su panel azul como `heading`, el campo de juego como `primary` y el detalle de objetos como un `Modal` declarado en `overlays`.
- What Would You Do entrega su información como un `InteractiveInfoAside` que agrupa un `ComposeGroup`, y reserva `primary` para los pasos interactivos.
- Los controladores conservan únicamente estado, efectos, reglas y handlers. La distribución de regiones ya no se construye mediante grids exclusivos dentro de esos controladores.
- Una prueba de renderizado estructural confirmó que ambos runtimes resuelven `heading` y `primary`, que Collect Objects conserva el overlay y que What Would You Do usa el aside público.

### Limpieza de advertencias — 2026-08-03

- Se retiró la clave duplicada `borderColor` de `UserCard.jsx`.
- `LogOut.jsx` usa un único import estático, porque `SidebarLayout` ya lo necesitaba de esa forma; desaparece la combinación estática/dinámica advertida por Vite.
- Se eliminaron variables sin uso detectadas por ESLint en What Would You Do y se corrigió la dependencia faltante del efecto de Collect Objects.

La migración y la primera validación visual de los cinco procedimentales están completadas. Las siguientes revisiones pueden concentrarse en pasos posteriores de las misiones largas —por ejemplo, ofertas y plan de pagos del módulo 5— sin cambios adicionales de arquitectura.

### Contrato final de archivos de juego — 2026-08-03

Esta sección reemplaza la organización transitoria descrita anteriormente para los módulos 3, 4 y 5.

Cada carpeta de `/templates/game/<juego>` puede contener como máximo estos tres archivos:

```text
<juego>/
├── <juego>.config.js
├── <juego>.controller.js   # solo cuando coordina hooks o estado propio
└── <juego>.runtime.js
```

El contrato es el siguiente:

- `config.js` contiene datos predeterminados, normalización y reglas puras.
- `controller.js` contiene hooks, estado y handlers. Su límite React devuelve el runtime mediante `renderRuntime`, pero no construye JSX ni importa bloques visuales.
- `runtime.js` construye una descripción declarativa con `layoutVariant`, `slots`, `overlays`, `block` y `props`. No contiene JSX y no importa `Card`, `Modal`, `Typography`, `ComposeGroup` u otros componentes visuales.
- `MissionViewTemplate` resuelve los nombres declarados contra el diccionario público de bloques y es responsable de construir el árbol React.
- Si toda la interacción ya vive en un bloque reutilizable, no se crea un controlador vacío. En esos casos la carpeta conserva solamente `config.js` y `runtime.js`.

La estructura resultante es:

```text
game/
├── dailySpending/
│   ├── dailySpending.config.js
│   ├── dailySpending.controller.js
│   └── dailySpending.runtime.js
├── objectClassification/
│   ├── objectClassification.config.js
│   └── objectClassification.runtime.js
├── budgetAdjustment/
│   ├── budgetAdjustment.config.js
│   ├── budgetAdjustment.controller.js
│   └── budgetAdjustment.runtime.js
├── collectObjects/
│   ├── collectObjects.config.js
│   ├── collectObjects.controller.js
│   └── collectObjects.runtime.js
└── whatWouldYouDo/
    ├── whatWouldYouDo.config.js
    ├── whatWouldYouDo.controller.js
    └── whatWouldYouDo.runtime.js
```

Cambios aplicados:

- `budgetAdjustment.runtime.jsx` pasó a `budgetAdjustment.runtime.js`; el límite React se trasladó a `budgetAdjustment.controller.js`.
- Daily Spending quedó completado bajo el mismo contrato: `dailySpending.config.js` conserva normalización y reglas puras, `dailySpending.controller.js` administra selección, saldo, persistencia y navegación con hooks, y `dailySpending.runtime.js` describe `InteractiveInfoAside`, `ChooseOne` y `Shopping` mediante nombres de bloque. El runtime que estaba documentado pero faltaba físicamente fue incorporado y el antiguo `DailySpendingTemplate.jsx` permanece retirado.
- `CollectObjectsTemplate.jsx` salió de `/game`. La mecánica configurable se expone ahora como el bloque interactivo `CollectObjects`, solicitado por nombre desde `collectObjects.runtime.js`.
- `SurplusDecisionStage.jsx` salió de `/game` y se convirtió en el bloque reutilizable `SurplusDecision`, usado internamente por la mecánica de recolección cuando la configuración activa esa variante.
- `WhatWouldYouDoTemplate.jsx` salió de `/game`. Su presentación se convirtió en el bloque `LoanPlanning`; el estado y las reglas permanecen en `whatWouldYouDo.controller.js`, y el runtime construye tanto el aside como la interacción mediante nombres de bloque.
- `useWhatWouldYouDoLogic.js` se integró en `whatWouldYouDo.controller.js`; `useBudgetAdjustmentController.js` se integró en `budgetAdjustment.controller.js`.
- `InvestmentSurplusTemplate.jsx` fue eliminado porque no estaba registrado ni tenía consumidores. Su comportamiento vigente ya está representado por la variante `SurplusDecision` usada en el módulo 4. Al ser un archivo versionado, puede recuperarse desde Git si fuera necesario consultar su implementación histórica.
- El registro de MissionView dejó de importar `CollectObjectsTemplate.jsx` y `WhatWouldYouDoTemplate.jsx`. Daily Spending, Budget Adjustment y What Would You Do usan límites controladores porque coordinan hooks o estado; Collect Objects y Object Classification se resuelven directamente como runtimes declarativos.
- Las rutas del registro incluyen la extensión `.js`, evitando que el servidor de desarrollo conserve resoluciones ambiguas después de mover o renombrar archivos.
- Los bloques grandes `CollectObjects` y `LoanPlanning` se cargan de forma diferida desde el diccionario para no incorporarlos a todas las actividades.

La comprobación estructural confirmó que `/templates/game` contiene cero archivos `.jsx`, que ninguna carpeta supera tres archivos y que los cinco runtimes construyen su presentación mediante nombres de bloque. ESLint pasó sin errores en los archivos migrados y la compilación de producción terminó correctamente con 2740 módulos transformados. La recarga del navegador confirmó que desapareció el error de importación de Vite, pero redirigió al inicio de sesión; por ello la revisión visual autenticada posterior a esta corrección queda pendiente de volver a iniciar sesión.

### Eliminación de mini-templates dentro de blocks — 2026-08-04

La revisión posterior detectó que el límite de tres archivos en `/game` se había conseguido trasladando demasiado JSX a tres componentes monolíticos. Cumplían formalmente la estructura, pero `CollectObjects.jsx`, `SurplusDecision.jsx` y `LoanPlanning.jsx` seguían actuando como templates particulares.

Se corrigió de esta manera:

- `LoanPlanning.jsx` fue eliminado. Las etapas de materiales, ofertas, estrategia de pago, pagos semanales y resultado se construyen ahora declarativamente desde `whatWouldYouDo.runtime.js` con `Shopping`, `CollageCard`, `Card`, `Input`, `Button`, `Typography`, `ComposeGroup` e `InteractiveInfoAside`.
- También se eliminó `buildLoanPlanningAsideItems`, que estaba duplicado y no tenía consumidores.
- `SurplusDecision.jsx` fue eliminado. Sus cálculos puros pasaron a `collectObjects.config.js`, su estado y persistencia a `collectObjects.controller.js`, y sus etapas visuales a `collectObjects.runtime.js`.
- `CollectObjects.jsx` fue eliminado. El único componente especializado que permanece es `FallingObjects.jsx`, un motor genérico que recibe objetos, rondas, objetivo, velocidades y callbacks sin conocer el módulo 4, el excedente ni el sistema de puntuación de la misión.
- `Collect Objects` ahora sí utiliza los tres archivos permitidos porque necesita estado: configuración, controlador y runtime.
- `Input` amplió su contrato base con `disabled`, `inputMode` y `autoComplete`, evitando introducir un input particular para los pagos.
- El diccionario de bloques carga diferidamente `FallingObjects`; ya no registra `LoanPlanning`, `CollectObjects` ni `SurplusDecision`.

El código JSX especializado en esos tres bloques pasó de 3946 líneas distribuidas en tres mini-templates a un motor visual genérico de aproximadamente 308 líneas. Las composiciones específicas permanecen en runtimes sin JSX. La auditoría encontró cero referencias a los tres bloques retirados, cero archivos `.jsx` dentro de `/templates/game`, ESLint pasó sin errores y el build de producción terminó correctamente con 2739 módulos transformados.

### Depuración de What Would You Do — 2026-08-04

Después de retirar `LoanPlanning`, `whatWouldYouDo.controller.js` todavía conservaba 1698 líneas. La causa era una acumulación innecesaria de contenido predeterminado, compatibilidad antigua, cálculos repetidos, múltiples estados, reglas de intentos y construcción de modelos visuales dentro del mismo hook.

La misión se depuró desde el flujo declarado actualmente en `m5-procedimental.json`:

1. seleccionar materiales necesarios;
2. comparar y elegir una oferta suficiente y clara;
3. elegir una estrategia y registrar pagos semanales;
4. calcular deuda, caja, ganancia y resultado.

Cambios realizados:

- Se eliminó la copia completa del contenido del documento dentro del controlador. `getWhatWouldYouDoModel` normaliza directamente `data.game`.
- Los estados dispersos se sustituyeron por un único `loanReducer`.
- Las operaciones financieras se redujeron a un selector puro: costo de materiales, financiamiento necesario, reserva, dinero disponible, cuota sugerida, deuda y resultado.
- Se eliminaron cálculos sin consumidores, modelos de aside duplicados, ramas de compatibilidad no utilizadas y multiplicadores de intentos que repetían el mismo flujo.
- El controlador solo conecta el reducer, valida eventos, persiste el snapshot y entrega datos al runtime.
- La persistencia mantiene compatibilidad básica con estados anteriores mediante `pendingAmount → debtRemaining` y normalización de `scores`.
- El runtime construye el aside directamente desde un contrato compacto `{ title, cards, metrics, message, action }`.

Resultado de tamaño:

```text
whatWouldYouDo.config.js       229 líneas
whatWouldYouDo.controller.js   337 líneas
whatWouldYouDo.runtime.js      432 líneas
                               -----------
total                           998 líneas
```

El controlador bajó de 1698 a 337 líneas y el conjunto completo quedó por debajo de 1000 líneas. ESLint, `git diff --check`, una prueba del cálculo base y el build de producción con 2739 módulos pasaron correctamente.

### Corrección de acceso al procedimental del módulo 5 — 2026-08-04

Al aislar la vista `whatWouldYouDo` se reprodujo el bloqueo que dejaba la misión en blanco. El runtime declarativo combina dos formas válidas de entregar propiedades a un bloque:

- un objeto estático, cuando las propiedades ya están resueltas;
- una función, cuando deben calcularse con el `payload` o el contexto actual.

`MissionViewTemplate` solo contemplaba la segunda forma y ejecutaba cualquier `slotDef.props` como función. Los bloques estáticos del módulo 5 provocaban por ello `TypeError: slotDef.props is not a function` al montar la primera etapa.

Se corrigió `renderSlot` para resolver funciones cuando corresponda y aceptar directamente objetos estáticos en los demás casos. El ajuste pertenece al renderer común, no al juego, porque ambas formas son parte del contrato declarativo de todas las misiones.

La validación posterior confirmó que la etapa inicial del módulo 5 renderiza el aside, los productos, los nueve materiales, el resumen de compra y el botón de revisión. También se seleccionó un material y se comprobó `aria-pressed="true"` sin nuevos errores de consola.

### Recuperación visual del juego de recolección del módulo 4 — 2026-08-04

La primera migración de `Collect Objects` conservó la mecánica, pero alteró demasiado la composición original: el aside pasó a ocupar cerca de un tercio de la pantalla, la tarjeta de meta creció en exceso, el panel de instrucciones se contrajo al ancho mínimo de su contenido y la canasta podía desplazarse antes de iniciar el juego.

Se recuperó la jerarquía visual anterior sin restaurar el template monolítico:

- `secondaryEmphasis` ahora expresa una columna auxiliar acotada con `clamp(...)` y una región principal flexible. La definición continúa siendo global y basada en regiones, no particular del módulo 4.
- `collectObjects.runtime.js` compone el aside con `InteractiveInfoAside`, `ComposeGroup`, `Typography`, `Card` y `ProgressBar`. La meta se construye como una agrupación declarativa y utiliza la decoración `badge` ya disponible en `Card` para mostrar el precio.
- El título, la meta y el monto recolectado recuperaron alturas diferenciadas para acercarse a las proporciones de la versión anterior.
- `FallingObjects` mantiene su carácter de motor reutilizable, pero su estado inicial usa un panel ancho, botón primario y una franja de piso más baja.
- La canasta permanece centrada mientras el juego está inactivo; el movimiento con el puntero solo se procesa durante el estado `playing`.

La validación visual se realizó a 1858 × 872, equivalente a la referencia proporcionada. Se comprobó además que el botón `Comenzar` activa la primera semana y que no aparecen errores ni advertencias en consola.

#### Ancho estable y distribución interna del aside

El ancho lateral se consolidó como `MISSION_SIDE_PANEL_WIDTH` dentro de los layouts globales. De esta forma, cualquier misión que use `secondaryEmphasis` obtiene la misma columna auxiliar mediante `clamp(18rem, 23vw, 22rem)` y deja el espacio restante a la interacción principal.

La primera corrección intentó repartir el alto mediante pesos, pero eso hacía que todos los bloques ocuparan una fracción obligatoria aunque su contenido fuera corto. Se retiró ese contrato adicional de `ComposeGroup` para conservar una API más simple y predecible.

La distribución definitiva utiliza el comportamiento natural existente: título, recaudación y progreso miden según su contenido; solo la agrupación de Meta declara `grow` y aprovecha el espacio restante. La Meta mantiene además un mínimo de seguridad para no colapsar en pantallas bajas. La comprobación visual confirmó que desaparece el espacio sobrante bajo el título y que la misma composición se conserva durante la semana de juego.

#### Cards y cadencia de caída

La revisión del juego activo mostró que los objetos seguían construyéndose con marcado particular dentro de `FallingObjects`, en vez de reutilizar el sistema común de tarjetas. Además, el motor interpretaba los valores `itemFallMin` y `itemFallMax` como avance porcentual en cada intervalo de 32 ms; con los valores `2.3` y `3.8`, una tarjeta podía atravesar el tablero aproximadamente en uno o dos segundos. El intervalo también se desmontaba y creaba nuevamente con cada movimiento de la canasta porque dependía directamente de `basketX` y `queueIndex`.

Se aplicaron estas correcciones:

- Cada objeto descendente se construye ahora con `Card`: la imagen ocupa la región superior, el nombre aparece debajo y el importe se agrega mediante la interacción decorativa `badge`.
- Los ingresos conservan borde y badge verdes; los gastos utilizan rojo y muestran el signo correspondiente.
- La velocidad del módulo 4 se ajustó al rango `0.8–1.15`, lo que permite observar y distinguir mejor varios objetos antes de que abandonen el tablero.
- El avance usa el tiempo transcurrido entre ciclos para que la velocidad sea estable aunque el navegador retrase ocasionalmente un intervalo.
- La posición de la canasta y el índice real de la cola se guardan en referencias transitorias. Mover la canasta ya no reinicia el temporizador y la cola continúa entregando todos los objetos configurados en las rondas.

ESLint pasó sin errores sobre el motor y la configuración, y el build de producción terminó correctamente con 2739 módulos transformados. La aplicación local abrió en la pantalla de inicio de sesión; por ello, la comprobación visual autenticada de esta iteración queda pendiente, aunque la composición y la secuencia fueron verificadas estáticamente.

## Espacio para retroalimentación

Registrar aquí observaciones después de probar:

- Módulo:
- Pantalla o paso:
- Qué se esperaba:
- Qué ocurrió:
- Prioridad:
- Captura o referencia:
