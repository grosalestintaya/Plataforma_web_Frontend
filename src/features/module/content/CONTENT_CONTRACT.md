# Content Contract

Este documento define el contrato base para `ModulosQY`.
La meta es que futuras plantillas lean JSON consistente, predecible y escalable.

## 1. Estructura de carpetas

```text
/content
  /modulo1
    m1-conceptual.json
    m1-procedimental.json
    m1-actitudinal.json
  /modulo2
  /modulo3
  /modulo4
  /modulo5
  modulos.json
```

- `modulos.json`: metadata global de cada modulo.
- `moduloX/*.json`: contenido de una mision concreta.

## 2. Contrato de modulos.json

Cada modulo describe identidad, orden, tema y mapeo de misiones.

```json
{
  "modules": [
    {
      "id": "module-1",
      "code": "m01",
      "legacyCodes": ["m0", "m1"],
      "sortOrder": 1,
      "title": "Modulo 1",
      "name": "Necesidades y deseos",
      "theme": {
        "tone": "blue",
        "color": "#1e4cff",
        "accent": "#f5b400"
      },
      "missions": {
        "conceptual": {
          "title": "Necesidades y deseos",
          "activityId": "01",
          "activityKey": "m01-conceptual",
          "learn": [
            "Que son las finanzas personales y por que importan",
            "Ingresos, gastos, ahorro y metas en una sola idea"
          ],
          "outcome": "Tendras claridad para ordenar tu dinero."
        },
        "procedimental": {
          "title": "Clasificacion y priorizacion de gastos",
          "activityId": "02",
          "activityKey": "m01-procedimental",
          "learn": [
            "Diferenciar ingresos vs. gastos",
            "Clasificar gastos fijos, variables y hormiga"
          ],
          "outcome": "Podras registrar y entender tus gastos reales."
        },
        "actitudinal": {
          "title": "Autocontrol y presion social",
          "activityId": "03",
          "activityKey": "m01-actitudinal",
          "learn": [
            "Distinguir necesidad vs. deseo",
            "Tomar decisiones de compra con intencion"
          ],
          "outcome": "Tomaras mejores decisiones al gastar."
        }
      }
    }
  ]
}
```

Campos recomendados:

- `id`: id del modulo en backend o dominio.
- `code`: codigo corto usado por rutas y registry.
- `legacyCodes`: alias temporales para compatibilidad.
- `sortOrder`: posicion del modulo.
- `title`: etiqueta corta del modulo.
- `name`: nombre visible del contenido.
- `theme`: colores base del modulo.
- `missions`: diccionario con metadata de cada mision.
- `missions.*.learn`: lista corta de aprendizajes visibles en el menu.
- `missions.*.outcome`: resultado esperado o promesa de la mision.

## 3. Contrato de archivo de mision

Cada archivo de mision representa una sola experiencia lineal.

```json
{
  "id": "conceptual",
  "activityId": "01",
  "activityKey": "m01-conceptual",
  "headerTitle": "Conceptual",
  "missionTitle": "Necesidades y deseos",
  "views": []
}
```

Campos:

- `id`: clave de la mision.
- `activityId`: id real usado para attempts y tracking.
- `backendActivityId`: alias temporal aceptado por compatibilidad.
- `activityKey`: clave semantica estable del lado frontend.
- `headerTitle`: etiqueta corta del header.
- `missionTitle`: nombre largo de la mision.
- `views`: arreglo de pantallas de la mision.

## 4. Contrato de view

Cada `view` define una pantalla concreta.

```json
{
  "id": "m1_c_01_need",
  "template": "teoria",
  "variant": "examples",
  "data": {},
  "nav": {},
  "feedback": {},
  "completion": {}
}
```

Campos:

- `id`: identificador unico de la vista.
- `template`: plantilla principal.
- `variant`: variante de layout dentro de la plantilla.
- `data`: contenido que renderiza la plantilla.
- `nav`: reglas de navegacion de la vista.
- `feedback`: mensajes, ayudas o estado de evaluacion.
- `completion`: estado final o accion de cierre de la vista.

## 5. Contrato de tipografia

Toda pieza textual debe poder vivir como string o como objeto tipografico.
La forma oficial recomendada es el objeto.

### Forma corta

```json
"Hola"
```

### Forma recomendada

```json
{
  "text": "Hola",
  "variant": "body1",
  "color": "textSecondary",
  "align": "center"
}
```

### Forma multiparrafo

```json
{
  "paragraphs": [
    "Primer parrafo.",
    "Segundo parrafo."
  ],
  "variant": "body1",
  "color": "textSecondary",
  "align": "left"
}
```

Campos:

- `text`: contenido simple.
- `paragraphs`: lista de parrafos.
- `variant`: jerarquia visual.
- `color`: tono de color.
- `align`: alineacion.
- `component`: tag HTML opcional.

Regla:

- el contenido no debe inyectar clases CSS o Tailwind
- la presentacion debe resolverse con variantes y componentes del sistema

### Variantes oficiales

- `h1` a `h6`: jerarquia de titulos.
- `subtitle1` y `subtitle2`: subtitulos y ayudas destacadas.
- `body1` y `body2`: texto principal y secundario.
- `button`: texto de botones o acciones.
- `caption`: pie o microtexto contextual.
- `overline`: etiqueta superior en mayusculas.

### Tones oficiales

- `primary`
- `secondary`
- `textPrimary`
- `textSecondary`
- `muted`
- `accent`
- `success`
- `error`

## 6. Contrato de media

Las imagenes no deben ser strings sueltos dentro del contenido final.
La forma recomendada es un objeto de media.

```json
{
  "src": "assets/m1/need_comida.png",
  "alt": "Un plato de comida",
  "variant": "horizontal",
  "fit": "contain",
  "ratio": "4/3",
  "caption": {
    "text": "Comida",
    "variant": "label"
  }
}
```

Campos:

- `src`: ruta del asset.
- `alt`: texto accesible.
- `variant`: `square`, `vertical` o `horizontal`.
- `fit`: `contain` o `cover`.
- `ratio`: relacion visual sugerida.
- `caption`: texto asociado a la imagen.

Convencion recomendada:

- `square` = `1:1`
- `vertical` = `2:3`
- `horizontal` = `3:2`

### Galerias o listas visuales

```json
{
  "items": [
    {
      "src": "assets/m1/a.png",
      "alt": "Ejemplo A",
      "label": {
        "text": "Comida",
        "variant": "label"
      }
    }
  ]
}
```

Regla recomendada:

- si el elemento representa solo una imagen, usar `image`
- si representa una lista o collage, usar `items`

## 7. Contrato de subtitulos

Para evitar muchos nombres ad hoc, el contrato recomendado es:

```json
{
  "title": { "text": "Titulo principal", "variant": "hero" },
  "subtitle": { "text": "Subtitulo o bajada", "variant": "lead" },
  "text": { "text": "Texto principal", "variant": "body" },
  "note": { "text": "Texto de apoyo", "variant": "supporting" }
}
```

Uso semantico:

- `title`: encabezado principal.
- `subtitle`: bajada inmediata.
- `text`: desarrollo principal.
- `note`: aclaracion, consejo o cierre breve.

## 8. Contrato de bloques interactivos

Los bloques interactivos deben separar tres capas:

- `prompt`: lo que se le pide hacer al usuario.
- `activity`: configuracion del bloque.
- `feedback`: como responde el sistema.

### Ejemplo general

```json
{
  "prompt": {
    "title": { "text": "Clasifica los objetos", "variant": "section" },
    "text": { "text": "Arrastra cada elemento a su categoria.", "variant": "body" }
  },
  "activity": {
    "type": "classification",
    "id": "sit-1",
    "trackKey": "classification_situation_1"
  },
  "feedback": {
    "success": { "text": "Buen trabajo", "variant": "badge", "tone": "success" },
    "retry": { "text": "Revisa tus decisiones", "variant": "supporting", "tone": "muted" }
  }
}
```

### Tipos interactivos previstos

- `memoryPairs`
- `classification`
- `mcq`
- `openText`
- `sortOrder`
- `dragDrop`
- `flipCard`

### Payload recomendado para `flipCard`

```json
{
  "interaction": {
    "type": "flipCard",
    "color": "smoke",
    "frontColor": "smoke",
    "backColor": "green",
    "backCard": {
      "color": "red",
      "title": { "text": "Gasto fijo", "variant": "h3" },
      "text": { "text": "Es un pago que suele repetirse.", "variant": "body2" }
    }
  }
}
```

Reglas:

- `color`: color compartido para ambas caras.
- `frontColor`: override solo para la cara frontal.
- `backColor`: override solo para la cara posterior.
- `backCard.color`: override local del reverso, con mayor prioridad.
- colores admitidos: `smoke`, `green`, `red`, `orange`.
- aliases aceptados por compatibilidad: `income`, `expense`, `success`, `danger`, `error`, `warning`.

### Contrato recomendado para `activity`

```json
{
  "type": "memoryPairs",
  "id": "pairs-1",
  "trackKey": "pairs_1",
  "rules": {
    "unlockNextWhenComplete": true,
    "maxAttempts": 12
  },
  "payload": {}
}
```

Campos:

- `type`: tipo de interaccion.
- `id`: id local del bloque.
- `trackKey`: clave estable para analitica.
- `rules`: reglas de desbloqueo, intentos, score o validacion.
- `payload`: datos del juego o ejercicio.

### Payload de memory pairs

```json
{
  "type": "memoryPairs",
  "payload": {
    "grid": { "cols": 4, "rows": 3 },
    "cards": [
      { "id": "c1", "image": { "src": "assets/a.png", "alt": "A" }, "pairId": "p1" },
      { "id": "c2", "image": { "src": "assets/a-txt.png", "alt": "Texto A" }, "pairId": "p1" }
    ]
  }
}
```

### Payload de MCQ

```json
{
  "type": "mcq",
  "payload": {
    "question": {
      "text": "Que harias con 10 soles?",
      "variant": "section"
    },
    "options": [
      {
        "id": "a",
        "label": { "text": "Lo gasto", "variant": "label" },
        "value": "spend"
      },
      {
        "id": "b",
        "label": { "text": "Lo guardo", "variant": "label" },
        "value": "save"
      }
    ],
    "allowMultiple": false
  }
}
```

## 9. Contrato de estados finales

Toda vista que cierre una experiencia o subflujo debe definir un `completion`.

```json
{
  "completion": {
    "type": "success",
    "title": { "text": "Lo lograste", "variant": "hero" },
    "message": {
      "text": "Completaste la actividad correctamente.",
      "variant": "body"
    },
    "cta": {
      "label": { "text": "Volver al modulo", "variant": "label" },
      "action": {
        "type": "goToModuleMenu"
      }
    }
  }
}
```

Tipos sugeridos:

- `success`
- `partial`
- `retry`
- `reflection`
- `endOfMission`

Campos sugeridos:

- `type`: tipo de cierre.
- `title`: texto principal.
- `message`: texto explicativo.
- `summary`: lista corta de logros o aprendizajes.
- `media`: imagen o ilustracion de cierre.
- `cta`: accion principal.
- `secondaryCta`: accion secundaria.

## 10. Contrato de nav

La navegacion debe quedarse simple y declarativa.

```json
{
  "nav": {
    "mode": "cta",
    "label": "Empezar"
  }
}
```

Modos previstos:

- `normal`
- `cta`
- `locked`
- `lockedUntilComplete`

Para futuro:

- `autoNext`
- `hidden`

## 11. Ejemplo de view final recomendada

```json
{
  "id": "m1_p_01_intro",
  "template": "practiceIntro",
  "variant": "split",
  "data": {
    "title": { "text": "Hora de practicar", "variant": "hero" },
    "subtitle": {
      "text": "Aprenderas a decidir con prioridad y presupuesto.",
      "variant": "lead"
    },
    "text": {
      "paragraphs": [
        "Usaras una cantidad limitada de dinero durante un dia escolar.",
        "Observa con atencion cada escenario antes de elegir."
      ],
      "variant": "body",
      "align": "left"
    },
    "image": {
      "src": "assets/m1/proc/hero.png",
      "alt": "Escena de practica",
      "caption": { "text": "Situacion inicial", "variant": "caption" }
    }
  },
  "nav": {
    "mode": "cta",
    "label": "Empezar"
  }
}
```

## 12. Reglas de limpieza para los JSON

- Evitar nombres ambiguos como `leftText`, `rightMedia`, `twoCards` cuando el contenido pueda expresarse en un contrato comun.
- Preferir claves semanticas: `title`, `subtitle`, `text`, `note`, `image`, `items`, `prompt`, `activity`, `completion`.
- Usar objetos tipograficos para todo texto nuevo.
- No mezclar strings y objetos en la misma coleccion si el bloque ya depende de metadatos visuales.
- Cuando un bloque sea interactivo, sus datos deben vivir dentro de `activity.payload`.

## 13. Decision recomendada para las nuevas plantillas

La base comun para futuras plantillas debe ser:

- `title`
- `subtitle`
- `text`
- `note`
- `image`
- `items`
- `prompt`
- `activity`
- `feedback`
- `completion`

Con eso, las nuevas plantillas pueden variar en layout sin volver a rediseñar el contrato de contenido.
