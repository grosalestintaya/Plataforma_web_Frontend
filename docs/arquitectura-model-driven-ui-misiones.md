# Arquitectura Model-Driven UI para misiones interactivas

## Nombre recomendado

El módulo de misiones puede describirse como:

> **Model-Driven UI con MissionTemplate único y generación dinámica de interfaces de usuario a partir de modelos declarativos en JSON.**

Una forma equivalente, más breve, es:

> **Arquitectura orientada por modelos declarativos JSON para misiones interactivas.**

Esta denominación es adecuada porque las misiones no se implementan como pantallas React independientes. En su lugar, cada misión se define como un modelo estructurado en JSON. Ese modelo describe vistas, layouts, variantes, contenido, navegación e interacciones. Luego, un renderer general de misión, implementado en `MissionViewTemplate.jsx`, interpreta el modelo y genera la interfaz correspondiente mediante componentes reutilizables.

## Definición para el informe de tesis

El módulo de misiones fue implementado bajo un enfoque **Model-Driven UI**, en el cual cada misión se representa mediante un modelo declarativo en formato JSON. Dicho modelo contiene la estructura pedagógica y funcional de la experiencia: metadatos de la misión, lista de vistas, plantilla de renderizado, distribución de contenido, elementos visuales, reglas de navegación, criterios de completitud e interacciones.

La aplicación no construye manualmente una página distinta para cada misión. En cambio, utiliza un `MissionTemplate` único en React que interpreta el modelo JSON, resuelve el layout o runtime correspondiente desde un registro interno y compone la interfaz mediante bloques reutilizables. De esta forma, el contenido queda separado de la presentación y del control de flujo, favoreciendo escalabilidad, reutilización y mantenibilidad.

## Relación con buenas prácticas conocidas

La implementación combina varios enfoques y patrones reconocidos en desarrollo de software:

- **Model-Driven UI**: la interfaz se construye a partir de un modelo estructurado.
- **Data-Driven UI**: los datos declarados determinan qué se muestra.
- **Configuration-Driven UI**: el comportamiento de las vistas se parametriza mediante configuración.
- **Declarative UI Rendering**: el JSON declara qué debe existir en la interfaz; React se encarga de renderizarlo.
- **Component Registry Pattern**: las plantillas y componentes disponibles se resuelven mediante registros.
- **Separation of Concerns**: contenido, validación, navegación, renderizado y persistencia se separan en capas distintas.
- **Reusable Component Architecture**: las vistas se componen con bloques reutilizables.

No debe describirse como **Server-Driven UI** en sentido estricto, porque actualmente los modelos JSON están versionados dentro del frontend y no son enviados por el servidor en tiempo de ejecución. Se puede decir que se asemeja a Server-Driven UI por su separación entre definición y renderizado, pero la clasificación más precisa es Model-Driven UI o Configuration-Driven UI.

Tampoco es recomendable llamarlo **Generative UI** como término principal, ya que no genera componentes mediante inteligencia artificial ni crea interfaces nuevas de forma autónoma. La interfaz se genera dinámicamente, pero a partir de modelos declarativos previamente definidos.

## Estructura general

La construcción de una misión sigue este flujo:

```text
Modelo JSON de misión
  -> validación de contrato
  -> normalización en content registry
  -> selección de misión por ruta
  -> reproductor de vistas
  -> resolución de layout/runtime
  -> runtime o controller
  -> renderizado con bloques React
```

En el proyecto, las capas principales son:

```text
src/features/module/content/
  modulos.json
  moduloX/mX-*.json
  mission.schema.js
  content.registry.js

src/features/module/pages/
  ModuleMenuPage.jsx
  ModuleActivtyPage.jsx

src/features/module/hooks/activity/
  useModulePlayer.js
  useMissionAttempt.js
  useActivityInteractiveState.js

src/features/module/templates/
  index.js
  views/mission/MissionViewTemplate.jsx
  views/mission/missionView.registry.js
  views/general/theoryRuntime.js
  views/general/quizRuntime.js
  views/general/lobbyRuntime.jsx

src/features/module/blocks/
  componentes base, contenedores, agrupadores e interactivos
```

## Modelo de módulo

El archivo `src/features/module/content/modulos.json` contiene la metadata global de los módulos y sus misiones. Su función principal es describir el catálogo pedagógico visible en el menú.

Ejemplo simplificado:

```json
{
  "schemaVersion": "1.0",
  "modules": [
    {
      "id": "module-1",
      "code": "m01",
      "sortOrder": 1,
      "title": "Modulo 1",
      "name": "El dinero y mis decisiones cotidianas",
      "theme": {
        "tone": "green",
        "color": "#00c853",
        "accent": "#f5b400"
      },
      "missions": {
        "conceptual": {
          "title": "El dinero en la vida cotidiana",
          "activityId": "01",
          "activityKey": "m01-conceptual",
          "learn": [],
          "outcome": "Resultado esperado de la misión."
        }
      }
    }
  ]
}
```

Este archivo define:

- identidad del módulo;
- orden del módulo;
- colores y tema visual;
- misiones disponibles;
- aprendizajes visibles en el menú;
- relación con actividades del backend mediante `activityId` o `activityKey`.

## Modelo de misión

Cada misión se define en un archivo JSON independiente dentro de `src/features/module/content/moduloX/`.

Ejemplo:

```json
{
  "schemaVersion": "1.0",
  "id": "conceptual",
  "activityId": "01",
  "backendActivityId": "01",
  "activityKey": "m01-conceptual",
  "headerTitle": "Conceptual",
  "missionTitle": "El dinero en la vida cotidiana",
  "views": []
}
```

Cada archivo representa una experiencia lineal. Su parte más importante es `views`, porque ahí se define la secuencia de pantallas que el usuario recorrerá.

## Modelo de vista

Una vista describe una pantalla concreta de la misión.

Ejemplo simplificado:

```json
{
  "viewId": "m1_1_v1",
  "order": 1,
  "name": "VISTA 1 - Inicio",
  "template": "preGameLobby",
  "variant": "preGame",
  "slots": {
    "title": {
      "text": "El dinero en la vida cotidiana",
      "variant": "h1",
      "align": "center"
    },
    "body": {
      "paragraphs": [
        "En esta misión reconocerás dónde aparece el dinero en tu vida diaria."
      ],
      "variant": "body1",
      "align": "justify"
    },
    "media": {
      "src": "1/uso-dinero.webp",
      "alt": "Situaciones cotidianas donde el dinero está presente",
      "variant": "vertical"
    }
  },
  "elements": {
    "base": [
      {
        "component": "heading",
        "slot": "title",
        "area": "title",
        "order": 10
      }
    ],
    "compound": []
  },
  "navigation": {
    "mode": "cta",
    "label": "Empezar",
    "action": "startMissionAttempt"
  },
  "completionCriteria": {
    "type": "manualStart"
  }
}
```

Campos principales:

- `viewId`: identificador único de la vista dentro de la misión.
- `order`: posición de la vista en la secuencia.
- `template`: identificador de layout/runtime que será interpretado por el `MissionTemplate`.
- `variant`: variante visual o funcional del template.
- `slots`: contenido semántico disponible para la plantilla.
- `elements`: componentes base o compuestos que se renderizan.
- `navigation`: reglas de navegación.
- `completionCriteria`: criterio para considerar la vista completada.

## Validación del modelo

La validación del contrato está implementada en:

```text
src/features/module/content/mission.schema.js
```

Este archivo define:

- `MISSION_SCHEMA_VERSION`;
- templates permitidos;
- modos de navegación permitidos;
- acciones de navegación permitidas;
- componentes registrados;
- validación de catálogo de módulos;
- validación de cada misión;
- validación de cada vista;
- validaciones específicas para vistas quiz.

La validación se ejecuta en dos puntos:

1. En tiempo de carga del contenido, desde `content.registry.js`.
2. Manualmente desde consola, con el comando:

```bash
npm run validate:missions
```

Si `npm` no está disponible en el entorno, puede ejecutarse directamente:

```bash
node tools/validate-missions.mjs
```

El resultado esperado para el estado actual es:

```text
OK: 15 misiones validas con schemaVersion 1.0.

Avisos:
- m06.conceptual: mision declarada sin archivo de contenido
- m06.procedimental: mision declarada sin archivo de contenido
- m06.actitudinal: mision declarada sin archivo de contenido
```

El aviso de `m06` indica que el módulo 6 existe en el catálogo, pero aún no tiene archivos JSON de contenido. No se considera error porque es contenido pendiente.

## Registro y normalización del contenido

El archivo `src/features/module/content/content.registry.js` importa:

- `modulos.json`;
- cada archivo de misión;
- el validador del modelo.

Luego agrupa el contenido por módulo:

```text
m01
  conceptual
  procedimental
  actitudinal

m02
  conceptual
  procedimental
  actitudinal
```

Después, la función `buildMission()` fusiona metadata y contenido:

```text
metadata de modulos.json
  + contenido de moduloX/mX-*.json
  + normalización de vistas
  = misión lista para reproducirse
```

El resultado se expone como:

```js
MODULE_CONTENT_MAP
```

Conceptualmente:

```js
{
  m01: {
    moduleCode: "m01",
    title: "Modulo 1",
    theme: {},
    missions: {
      conceptual: {
        id: "conceptual",
        activityId: "01",
        missionTitle: "...",
        views: []
      }
    }
  }
}
```

## Reproductor de misión

La página de actividad está en:

```text
src/features/module/pages/ModuleActivtyPage.jsx
```

Esta página:

- lee `moduleCode` y `missionKey` desde la URL;
- obtiene el módulo desde `MODULE_CONTENT_MAP`;
- valida la misión seleccionada;
- inicia o completa intentos mediante backend;
- administra estado interactivo;
- entrega `heroApi` a las plantillas;
- renderiza `Header`, `Hero` y `Footer`.

El control de flujo de la misión está en:

```text
src/features/module/hooks/activity/useModulePlayer.js
```

Este hook funciona como reproductor de vistas. Controla:

- misión actual;
- índice de vista actual;
- vista visible actual;
- avance;
- retroceso;
- salto por `viewId`;
- bloqueo de vistas;
- detección de `preGame` y `postGame`;
- cierre de misión antes de entrar a la vista final.

## Renderizado dinámico

El componente `ActivityHero` obtiene la vista actual y resuelve su template:

```js
const views = moduleData.missions?.[missionKey]?.views ?? [];
const view = views[viewIndex];
const Template = view ? templates[view.template] : null;
```

Luego renderiza:

```jsx
<Template
  variant={view.variant}
  data={view.data}
  heroApi={heroApi}
  view={view}
/>
```

Esto demuestra el principio Model-Driven UI: el componente no sabe qué misión específica está mostrando. Solo interpreta el modelo de la vista.

## Registro de layouts y runtimes

Los ids disponibles para las vistas se registran en:

```text
src/features/module/templates/index.js
src/features/module/templates/views/mission/missionView.registry.js
```

Ejemplos:

```text
simpleTheory -> MissionTemplate -> theory runtime
explanationTheory -> MissionTemplate -> theory runtime
simpleQuiz -> MissionTemplate -> quiz runtime
preGameLobby -> MissionTemplate -> lobby runtime controller
postGameLobby -> MissionTemplate -> lobby runtime controller
waitLobby -> MissionTemplate -> lobby runtime controller
budgetAdjustment -> BudgetAdjustmentMissionController
collectObjects -> CollectObjectsMissionController
whatWouldYouDo -> WhatWouldYouDoMissionController
```

Las vistas simples se resuelven mediante runtimes reutilizables dentro de `views/general`. El lobby tambien entra por `MissionViewTemplate` y delega su comportamiento a un controller registrado. Las vistas de juego o interaccion compleja usan el mismo mecanismo cuando necesitan estado local, efectos o hooks. Por tanto, `simpleTheory`, `splitTheory`, `simpleQuiz`, `preGameLobby` o `assessmentTheory` no son carpetas ni templates React independientes; son ids de layout/runtime que el `MissionTemplate` interpreta.

## Renderer general

El renderer principal y único de las vistas de misión es:

```text
src/features/module/templates/views/mission/MissionViewTemplate.jsx
```

Su función es:

1. recibir una vista del modelo JSON;
2. obtener la definición del layout/runtime;
3. crear un runtime;
4. resolver layout;
5. renderizar slots;
6. componer bloques reutilizables.

El renderer utiliza:

```text
HeroGrid
HeroArea
Blocks
```

De esta forma, la vista JSON se convierte en una interfaz React sin crear un componente exclusivo por misión.

## Beneficios de la arquitectura

### Escalabilidad

Permite agregar nuevas misiones creando o modificando archivos JSON, sin duplicar pantallas React completas.

### Reutilización

Las misiones comparten templates, layouts, bloques visuales e interacciones.

### Mantenibilidad

El contenido, la navegación y el renderizado están separados. Esto reduce acoplamiento y facilita cambios localizados.

### Consistencia

El contrato versionado y la validación automática obligan a que las misiones sigan una estructura común.

### Extensibilidad

Se pueden agregar nuevos templates o controllers registrándolos en el sistema, sin reescribir el reproductor.

### Control de calidad

El comando de validación detecta errores como:

- `viewId` duplicados;
- templates inexistentes;
- imágenes sin `src`;
- modos de navegación inválidos;
- vistas quiz sin preguntas;
- misiones sin `schemaVersion`;
- misiones sin vistas.

## Limitaciones actuales

Aunque la arquitectura ya está formalizada, existen límites importantes:

- Los modelos JSON viven localmente en el frontend, no en un CMS o backend.
- El módulo 6 está declarado en el catálogo, pero aún no tiene archivos de contenido.
- La validación es propia del proyecto, no usa una librería externa como Zod, AJV o JSON Schema.
- Algunas reglas específicas de juegos complejos todavía dependen de controllers especializados.

Estas limitaciones no invalidan la arquitectura. Solo indican que se trata de una implementación local y controlada de Model-Driven UI.

## Posible evolución

La arquitectura puede evolucionar hacia:

- JSON Schema formal;
- validación con AJV o Zod;
- editor visual de misiones;
- carga de modelos desde backend;
- versionado migrable entre `schemaVersion`;
- pruebas automáticas por template;
- previsualizador de misiones para docentes o administradores.

Si en el futuro los modelos se sirven desde backend, el sistema podría evolucionar hacia un enfoque más cercano a **Server-Driven UI**.

## Resumen técnico

La arquitectura implementada puede resumirse así:

```text
modulos.json
  -> define catálogo, módulos y metadata de misiones

moduloX/mX-*.json
  -> define modelos declarativos de misiones y vistas

mission.schema.js
  -> valida contrato y versión del modelo

content.registry.js
  -> importa, valida, fusiona y normaliza contenido

ModuleActivtyPage.jsx
  -> carga misión seleccionada y conecta estado/backend

useModulePlayer.js
  -> controla navegación y ciclo de vida de vistas

ActivityHero.jsx
  -> selecciona dinámicamente el renderer de la vista

MissionViewTemplate.jsx
  -> resuelve layout/runtime y lo convierte en bloques React

Blocks
  -> renderizan piezas reutilizables de interfaz
```

## Frase final recomendada para tesis

> La plataforma implementa un enfoque **Model-Driven UI con MissionTemplate único y generación dinámica de interfaces basada en modelos declarativos JSON**. En este enfoque, cada misión se define como un modelo versionado que describe su estructura, contenido, navegación e interacciones. Dicho modelo es validado, normalizado e interpretado por un renderer general en React, el cual resuelve layouts declarativos y compone la interfaz mediante componentes reutilizables. Esta solución permite separar contenido, lógica de flujo y presentación, favoreciendo la escalabilidad y mantenibilidad del sistema.
