# Componentes `iteractive`

Esta carpeta contiene los minijuegos y componentes interactivos usados por los modulos.

## Estructura recomendada

Cada componente interactivo debe seguir esta separacion:

- `Componente/Componente.jsx`
  Render del componente, estructura visual y estilos.
- `Componente/componenteController.js`
  Logica del componente: estado, eventos, reglas del juego, persistencia y transformacion de datos.

La idea es que el `jsx` quede enfocado en la construccion visual y el archivo `controller` se encargue del comportamiento.

## `Crossword`

Ubicacion:

- `crossword/Crossword.jsx`
- `crossword/crosswordController.js`

### Que hace

`Crossword` renderiza un crucigrama interactivo para reforzar conceptos del modulo.

Permite:

- seleccionar palabras desde el tablero,
- escribir directamente dentro de las casillas,
- validar automaticamente una palabra al completarla,
- marcar palabras correctas e incorrectas,
- persistir el avance usando `heroApi`.

### Datos esperados

`Crossword` puede recibir los datos en `data.crossword` o directamente en `data`.

Campos principales:

```js
{
  crossword: {
    words: [
      {
        id: "w1", // opcional
        number: 1, // opcional
        clue: "Herramienta que organiza ingresos y gastos.",
        answer: "PRESUPUESTO",
        image: {
          src: "activity/mi-imagen.png",
          alt: "Imagen de apoyo",
          variant: "square",
          mode: "contain"
        }
      }
    ],
    boardBackground: {
      src: "activity/fondo-tablero.png"
    },
    sidebarImage: {
      src: "activity/imagen-default.png",
      alt: "Imagen lateral"
    },
    minimumScore: 60,
    maximumScore: 100
  }
}
```

### Reglas internas

- Las palabras se normalizan a mayusculas y sin tildes.
- El layout del crucigrama se genera automaticamente segun las respuestas.
- La palabra mas larga se usa como base.
- Las demas palabras intentan cruzarse por letras en comun.
- Si una palabra no encuentra cruce valido, se intenta ubicar cerca del tablero actual.
- La palabra activa se escribe de forma secuencial y se valida al completarse.
- Las letras ya resueltas por cruces quedan bloqueadas, pero no interrumpen la escritura de la palabra activa.
- Si una palabra esta mal, se marca temporalmente y se limpia para volver a intentarla.
- Si una palabra esta bien, queda fija en el tablero y sus letras alimentan los cruces de las demas.
- Mientras el crucigrama no este completo, el score representa progreso y se mantiene por debajo del minimo de aprobacion.
- Al completarlo, el score final queda entre `minimumScore` y `maximumScore`: resolver una palabra al primer intento conserva el bonus; corregirla despues de un error deja solo el puntaje base.

### Integracion

El componente recibe:

- `data`
- `heroApi`
- `view`
- `className`

Ejemplo de uso:

```jsx
<Crossword
  data={viewData}
  heroApi={heroApi}
  view={view}
/>
```

### Persistencia

Se guarda en `heroApi.setInteractiveState(viewId, ...)`:

- palabras resueltas,
- borrador activo,
- palabra activa,
- porcentaje de avance.

Esto permite retomar el estado si la vista se vuelve a montar.

### Comportamiento esperado de entrada

- El usuario selecciona una palabra haciendo click sobre sus casillas.
- Solo la palabra activa queda editable.
- La escritura avanza por la palabra activa de izquierda a derecha o de arriba hacia abajo segun la orientacion generada.
- Las flechas izquierda/derecha mueven el cursor entre casillas editables de la palabra activa.
- `Backspace` borra la ultima casilla editable escrita, sin eliminar letras bloqueadas por un cruce ya resuelto.

## Estado actual del resto de componentes

Los otros componentes interactivos todavia no estan migrados por completo a carpeta propia:

- `Calculator.jsx`
- `ChooseOne.jsx`
- `ClasifyCard.jsx`
- `Form.jsx`
- `IteractionComplete.jsx`
- `MemoryPairs.jsx`
- `Shopping.jsx`

El patron a seguir para migrarlos sera el mismo usado en `Crossword`:

1. mover el render a una carpeta propia,
2. separar la logica a un archivo `controller`,
3. documentar datos esperados, eventos y persistencia.
