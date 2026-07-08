// game/ui/sceneUI.js
// Helpers de UI compartidos por las escenas de Phaser para mantener un estilo
// consistente (texto, botones, fondo) sin repetir la misma configuracion.
import Phaser from "phaser";

const CHEVRON_RADIUS = 13;
const CHEVRON_FILL = 0x1a1a1a;
const CHEVRON_BORDER = 0x4ade80;
const CHEVRON_BORDER_HOVER = 0x86efac;
const OPTION_TEXT_COLOR = "#4ade80";
const OPTION_TEXT_HOVER = "#bbf7d0";

const PANEL_MARGIN_X = 40;
const PANEL_MARGIN_BOTTOM = 24;
const PANEL_PADDING = 26;
const PANEL_FILL = 0x0d0d14;
const PANEL_ALPHA = 0.88;
const PANEL_OPTION_ROW_HEIGHT = 42;

export function createBackground(scene, key) {
  const bg = scene.add.image(
    scene.scale.width / 2,
    scene.scale.height / 2,
    key,
  );
  bg.setDisplaySize(scene.scale.width, scene.scale.height);
  bg.setDepth(0);
  return bg;
}

const FLOATING_ICONS = ["🎮", "🚀", "💎", "⭐", "❤️", "👾", "🕹️", "💰"];

// Paleta arcade compartida: verde, lila y oro (sin morado).
export const ARCADE_GREEN = 0x22c55e;
export const ARCADE_GREEN_HEX = "#22c55e";
export const ARCADE_LILAC = 0xc4b5fd;
export const ARCADE_LILAC_HEX = "#c4b5fd";
export const ARCADE_GOLD = 0xf5b400;
export const ARCADE_GOLD_HEX = "#f5b400";
const ARCADE_TITLE_STROKE = "#0f3325";
const ARCADE_TITLE_SHADOW = "#06140d";
const EQ_COLORS = [ARCADE_GREEN, ARCADE_LILAC, ARCADE_GOLD];

// Fondo arcade compartido (intro y resultados): degradado verde oscuro + grid
// lila tenue + viñeta verde que enfoca el centro.
export function createArcadeBackground(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;

  const bg = scene.add.graphics().setDepth(0);
  bg.fillGradientStyle(0x081712, 0x081712, 0x123a26, 0x0f3325, 1);
  bg.fillRect(0, 0, w, h);

  const grid = scene.add.graphics().setDepth(0);
  grid.lineStyle(1, ARCADE_LILAC, 0.06);
  const step = 48;
  for (let x = 0; x <= w; x += step) grid.lineBetween(x, 0, x, h);
  for (let y = 0; y <= h; y += step) grid.lineBetween(0, y, w, y);

  const vignette = scene.add.graphics().setDepth(0);
  vignette.fillStyle(0x000000, 0.3);
  vignette.fillRect(0, 0, w, h);
  vignette.fillStyle(ARCADE_GREEN, 0.12);
  vignette.fillEllipse(w / 2, h / 2, w * 0.9, h * 0.7);
}

// Estilo del titulo arcade dorado (usado por intro y resultados).
export function arcadeTitleStyle(fontSize) {
  return {
    fontSize: `${fontSize}px`,
    fontStyle: "bold",
    color: ARCADE_GOLD_HEX,
    stroke: ARCADE_TITLE_STROKE,
    strokeThickness: 8,
  };
}

export function applyArcadeTitleShadow(textObj) {
  textObj.setShadow(4, 6, ARCADE_TITLE_SHADOW, 0, true, true);
}

// Ecualizador animado en la franja inferior (barras verde/lila/oro).
export function createEqualizer(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const count = 32;
  const gap = 6;
  const barW = (w - gap * (count + 1)) / count;

  for (let i = 0; i < count; i += 1) {
    const x = gap + i * (barW + gap) + barW / 2;
    const baseH = Phaser.Math.Between(20, 70);
    const color = EQ_COLORS[i % EQ_COLORS.length];
    const bar = scene.add
      .rectangle(x, h - 8, barW, baseH, color, 0.85)
      .setOrigin(0.5, 1)
      .setDepth(1);

    scene.tweens.add({
      targets: bar,
      scaleY: Phaser.Math.FloatBetween(0.3, 1.7),
      duration: Phaser.Math.Between(400, 900),
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
      delay: Phaser.Math.Between(0, 600),
    });
  }
}

// Iconos retro flotando por los bordes, con oscilacion suave en loop.
export function createFloatingIcons(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const spots = [
    { x: 0.08, y: 0.16 }, { x: 0.9, y: 0.12 }, { x: 0.15, y: 0.75 },
    { x: 0.85, y: 0.8 }, { x: 0.5, y: 0.1 }, { x: 0.28, y: 0.26 },
    { x: 0.72, y: 0.28 }, { x: 0.5, y: 0.9 }, { x: 0.06, y: 0.5 },
    { x: 0.94, y: 0.52 },
  ];

  spots.forEach((spot, i) => {
    const icon = FLOATING_ICONS[i % FLOATING_ICONS.length];
    const size = Phaser.Math.Between(24, 36);
    const obj = scene.add
      .text(w * spot.x, h * spot.y, icon, { fontSize: `${size}px` })
      .setOrigin(0.5)
      .setDepth(1);
    obj.setAlpha(0.6);

    scene.tweens.add({
      targets: obj,
      y: obj.y - Phaser.Math.Between(10, 18),
      duration: Phaser.Math.Between(1400, 2200),
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
      delay: Phaser.Math.Between(0, 800),
    });
  });
}

// Pastilla flotante para indicadores persistentes (puntaje, progreso, etc).
// Expone setLabel() para actualizar el texto sin recrear el objeto.
export function createHudBadge(scene, x, y, text, { fontSize = 14 } = {}) {
  const paddingX = 14;
  const paddingY = 8;

  const label = scene.add
    .text(paddingX, paddingY, text, { fontSize: `${fontSize}px`, color: "#ffffff" })
    .setOrigin(0, 0);
  const height = label.height + paddingY * 2;

  const bg = scene.add.graphics();

  function draw(currentLabel) {
    const width = currentLabel.width + paddingX * 2;
    bg.clear();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(0, 0, width, height, height / 2);
  }
  draw(label);

  const container = scene.add.container(x, y, [bg, label]).setDepth(4);
  container.setLabel = (newText) => {
    label.setText(newText);
    draw(label);
  };

  return container;
}

// Panel de dialogo anclado a la parte inferior de la pantalla: texto arriba,
// y devuelve las coordenadas donde deben ubicarse las opciones debajo, ya
// calculadas segun cuantas opciones tenga este nodo (para que el panel crezca
// o se achique sin que nada se superponga).
export function createStoryPanel(scene, text, optionCount) {
  const panelX = PANEL_MARGIN_X;
  const panelWidth = scene.scale.width - PANEL_MARGIN_X * 2;
  const textWidth = panelWidth - PANEL_PADDING * 2;

  const label = scene.add
    .text(PANEL_PADDING, PANEL_PADDING, text, {
      fontSize: "20px",
      color: "#ffffff",
      wordWrap: { width: textWidth },
    })
    .setOrigin(0, 0);

  const optionsGap = optionCount > 0 ? 16 : 0;
  const panelHeight =
    PANEL_PADDING + label.height + optionsGap + optionCount * PANEL_OPTION_ROW_HEIGHT + PANEL_PADDING;
  const panelY = scene.scale.height - panelHeight - PANEL_MARGIN_BOTTOM;

  const bg = scene.add.graphics();
  bg.fillStyle(PANEL_FILL, PANEL_ALPHA);
  bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 18);
  bg.lineStyle(1, 0xffffff, 0.08);
  bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 18);

  const panel = scene.add.container(panelX, panelY, [bg, label]).setDepth(2);

  return {
    panel,
    optionsX: panelX + PANEL_PADDING,
    optionsY: panelY + PANEL_PADDING + label.height + optionsGap,
    optionsWidth: textWidth,
    optionRowHeight: PANEL_OPTION_ROW_HEIGHT,
  };
}

function drawChevron(graphics, borderColor) {
  graphics.clear();
  graphics.fillStyle(CHEVRON_FILL, 1);
  graphics.fillCircle(CHEVRON_RADIUS, CHEVRON_RADIUS, CHEVRON_RADIUS);
  graphics.lineStyle(2, borderColor, 1);
  graphics.strokeCircle(CHEVRON_RADIUS, CHEVRON_RADIUS, CHEVRON_RADIUS);
  graphics.fillStyle(borderColor, 1);
  graphics.fillTriangle(
    CHEVRON_RADIUS - 4, CHEVRON_RADIUS - 6,
    CHEVRON_RADIUS - 4, CHEVRON_RADIUS + 6,
    CHEVRON_RADIUS + 5, CHEVRON_RADIUS,
  );
}

// Opcion de lista al estilo "> Etiqueta" (sin caja alrededor), pensada para
// vivir dentro de un createStoryPanel. Mismo patron de capa visual separada
// del contenedor interactivo que createChoiceButton ya usaba: el area de clic
// (container) nunca cambia de escala/alpha por animacion, solo `visual`.
export function createChoiceButton(
  scene,
  label,
  { x, y, width, onClick, onHover, color = CHEVRON_BORDER, hoverColor = CHEVRON_BORDER_HOVER },
) {
  const textColor = Phaser.Display.Color.IntegerToColor(color).rgba;
  const textHoverColor = Phaser.Display.Color.IntegerToColor(hoverColor).rgba;

  const chevron = scene.add.graphics();
  drawChevron(chevron, color);

  const text = scene.add
    .text(CHEVRON_RADIUS * 2 + 14, CHEVRON_RADIUS, label, {
      fontSize: "18px",
      color: textColor,
    })
    .setOrigin(0, 0.5);

  const rowWidth = width ?? CHEVRON_RADIUS * 2 + 14 + text.width;
  const rowHeight = CHEVRON_RADIUS * 2;

  const visual = scene.add.container(0, 0, [chevron, text]);
  const container = scene.add.container(x, y, [visual]).setDepth(3);
  container.setSize(rowWidth, rowHeight);
  container.setInteractive({ useHandCursor: true });
  container.visual = visual;

  container.on("pointerover", () => {
    onHover?.();
    drawChevron(chevron, hoverColor);
    text.setColor(textHoverColor);
  });

  container.on("pointerout", () => {
    drawChevron(chevron, color);
    text.setColor(textColor);
  });

  if (onClick) {
    container.on("pointerdown", () => {
      scene.tweens.add({
        targets: visual,
        alpha: 0.55,
        duration: 70,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  return container;
}

// Ficha de datos (titulo + filas etiqueta/valor) dentro de un panel oscuro
// redondeado, para mostrar informacion estructurada (ver BankerScene).
export function createInfoCard(scene, { x, y, width, title, rows }) {
  const padding = PANEL_PADDING;

  const titleText = scene.add
    .text(padding, padding, title, { fontSize: "24px", color: "#ffffff", fontStyle: "bold" })
    .setOrigin(0, 0);

  let cursorY = padding + titleText.height + 14;
  const rowTexts = rows.map((row) => {
    const rowText = scene.add
      .text(padding, cursorY, `${row.label}: ${row.value}`, {
        fontSize: "17px",
        color: row.color ?? "#e5e7eb",
        wordWrap: { width: width - padding * 2 },
      })
      .setOrigin(0, 0);
    cursorY += rowText.height + 10;
    return rowText;
  });

  const cardHeight = cursorY - 10 + padding;

  const bg = scene.add.graphics();
  bg.fillStyle(PANEL_FILL, PANEL_ALPHA);
  bg.fillRoundedRect(0, 0, width, cardHeight, 18);
  bg.lineStyle(1, 0xffffff, 0.08);
  bg.strokeRoundedRect(0, 0, width, cardHeight, 18);

  const card = scene.add.container(x, y, [bg, titleText, ...rowTexts]).setDepth(2);

  return { card, cardHeight };
}

// Transicion con fade a negro antes de arrancar la siguiente escena, para
// evitar el corte seco de un scene.start() directo.
export function fadeToScene(scene, key, data, duration = 300) {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => {
    scene.scene.start(key, data);
  });
}

// Fade rapido DENTRO de la misma escena (fade-out -> callback -> fade-in), para
// que avanzar de un nodo/pantalla a otro no se sienta como un corte seco.
export function fadeSwap(scene, callback, duration = 160) {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => {
    callback();
    scene.cameras.main.fadeIn(duration, 0, 0, 0);
  });
}

// Aparicion suave (fade-in) para un conjunto de game objects recien creados.
export function fadeInObjects(scene, objects, duration = 180) {
  objects.forEach((obj) => obj.setAlpha(0));
  scene.tweens.add({
    targets: objects,
    alpha: 1,
    duration,
    ease: "Sine.Out",
  });
}

// Aparicion con "pop" (escala + fade, con pequeño rebote) para botones/opciones,
// escalonada por indice para que no aparezcan todos de golpe. Si el objeto
// expone una capa `.visual` (ver createChoiceButton), la escala se anima ahi
// y no en el contenedor interactivo, para no mover su area de clic.
export function popInObjects(scene, objects, { duration = 220, stagger = 60 } = {}) {
  objects.forEach((obj, i) => {
    const scaleTarget = obj.visual ?? obj;
    obj.setAlpha(0);
    scaleTarget.setScale(0.85);

    scene.tweens.add({
      targets: obj,
      alpha: 1,
      duration,
      delay: i * stagger,
      ease: "Sine.Out",
    });

    scene.tweens.add({
      targets: scaleTarget,
      scale: 1,
      duration,
      delay: i * stagger,
      ease: "Back.Out",
    });
  });
}

// -----------------------------------------------------------------------------
// Estilo "documento" (inspirado en Papers Please): una hoja vertical de papel
// con encabezado, nombre y filas de datos, para el minijuego del banquero.
// -----------------------------------------------------------------------------
const DOC_PAPER = 0xe9e2cf;
const DOC_PAPER_EDGE = 0xcfc6ac;
const DOC_HEADER = 0x3b3a34;
const DOC_INK = "#2b2a24";
const DOC_INK_SOFT = "#57544a";
const DOC_PADDING = 22;

// Hoja vertical de expediente. `rows` es una lista { label, value }. La altura
// se ajusta al contenido (con un minimo) para que nunca se corte una fila.
export function createDocumentCard(scene, { x, y, width, minHeight = 0, header, name, rows }) {
  const headerHeight = 46;
  const children = [];

  const headerText = scene.add
    .text(width / 2, headerHeight / 2, header, {
      fontSize: "18px",
      color: "#f3efe0",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  const nameText = scene.add
    .text(DOC_PADDING, headerHeight + 16, name, {
      fontSize: "26px",
      color: DOC_INK,
      fontStyle: "bold",
      wordWrap: { width: width - DOC_PADDING * 2 },
    })
    .setOrigin(0, 0);

  let cursorY = headerHeight + 16 + nameText.height + 14;
  const dividerY = cursorY;
  cursorY += 16;

  const rowTexts = [];
  rows.forEach((row) => {
    const labelText = scene.add
      .text(DOC_PADDING, cursorY, row.label.toUpperCase(), {
        fontSize: "14px",
        color: DOC_INK_SOFT,
      })
      .setOrigin(0, 0);
    cursorY += labelText.height + 3;

    const valueText = scene.add
      .text(DOC_PADDING, cursorY, row.value, {
        fontSize: "20px",
        color: DOC_INK,
        wordWrap: { width: width - DOC_PADDING * 2 },
        lineSpacing: 2,
      })
      .setOrigin(0, 0);
    cursorY += valueText.height + 14;

    rowTexts.push(labelText, valueText);
  });

  const height = Math.max(minHeight, cursorY + DOC_PADDING - 14);

  const bg = scene.add.graphics();
  bg.fillStyle(0x000000, 0.35);
  bg.fillRoundedRect(6, 8, width, height, 6);
  bg.fillStyle(DOC_PAPER, 1);
  bg.fillRoundedRect(0, 0, width, height, 6);
  bg.lineStyle(2, DOC_PAPER_EDGE, 1);
  bg.strokeRoundedRect(0, 0, width, height, 6);
  bg.fillStyle(DOC_HEADER, 1);
  bg.fillRoundedRect(0, 0, width, headerHeight, 6);
  bg.fillRect(0, headerHeight - 8, width, 8);
  bg.lineStyle(1, DOC_PAPER_EDGE, 1);
  bg.lineBetween(DOC_PADDING, dividerY, width - DOC_PADDING, dividerY);

  children.push(bg, headerText, nameText, ...rowTexts);

  const card = scene.add.container(x, y, children).setDepth(2);
  return { card, height };
}

// -----------------------------------------------------------------------------
// Boton con una imagen (ej. los sellos "aprobar"/"rechazar" del banquero). Al
// pasar el mouse crece un poco; al hacer click "estampa" (escala + leve
// rotacion). Mismo patron seguro que createChoiceButton: el contenedor
// interactivo (area de clic) nunca se anima, solo `visual`.
// -----------------------------------------------------------------------------
export function createImageButton(
  scene,
  textureKey,
  { x, y, width, height, onClick, onHover },
) {
  const img = scene.add.image(0, 0, textureKey).setOrigin(0.5);
  img.setDisplaySize(width, height);

  const visual = scene.add.container(0, 0, [img]);
  const container = scene.add.container(x, y, [visual]).setDepth(3);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });
  container.visual = visual;

  container.on("pointerover", () => {
    onHover?.();
    scene.tweens.add({ targets: visual, scale: 1.06, duration: 120, ease: "Sine.Out" });
  });
  container.on("pointerout", () => {
    scene.tweens.add({ targets: visual, scale: 1, duration: 120, ease: "Sine.Out" });
  });

  if (onClick) {
    container.on("pointerdown", () => {
      scene.tweens.add({
        targets: visual,
        scale: 0.9,
        angle: -4,
        duration: 90,
        yoyo: true,
        ease: "Quad.Out",
        onComplete: onClick,
      });
    });
  }

  return container;
}
