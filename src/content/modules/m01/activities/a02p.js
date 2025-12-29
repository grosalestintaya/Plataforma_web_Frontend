export default {
  id: "a02p",
  kind: "procedimental",
  title: "Actividad Procedimental: Arma tu mini-presupuesto",
  xp: 80,
  screens: [
    {
      id: "s1",
      type: "intro",
      title: "Manos a la obra",
      body:
        "Vas a aprender a tomar decisiones usando un mini-presupuesto.\n\n" +
        "Meta: que al final sepas priorizar gastos y separar ahorro.",
    },

    {
      id: "s2",
      type: "steps",
      title: "Pasos del presupuesto",
      steps: [
        { text: "1) Anota cuánto dinero tienes (ingresos)." },
        { text: "2) Lista tus gastos necesarios." },
        { text: "3) Separa un monto para ahorro/meta." },
        { text: "4) Ajusta: si no alcanza, recorta gastos no necesarios." },
      ],
      mustComplete: true,
    },

    {
      id: "s3",
      type: "simulation",
      title: "Escenario",
      scenario:
        "Tienes S/20 esta semana.\n" +
        "Gastos posibles:\n" +
        "- Pasaje: S/8 (necesario)\n" +
        "- Snacks: S/6 (opcional)\n" +
        "- Impresiones: S/5 (necesario)\n" +
        "- Ahorro meta: S/5 (recomendado)\n\n" +
        "Elige qué harás.",
      choices: [
        {
          id: "c1",
          label: "Pago pasaje + impresiones + ahorro (y reduzco snacks)",
          delta: { xp: 30, coins: 15 },
          resultText: "Buena decisión: priorizaste lo necesario y guardaste para tu meta.",
        },
        {
          id: "c2",
          label: "Pago pasaje + snacks + impresiones (sin ahorro)",
          delta: { xp: 15, coins: 5 },
          resultText: "Cumpliste lo necesario, pero no avanzaste en tu meta.",
        },
        {
          id: "c3",
          label: "Pago snacks + ahorro (y me falta para impresiones)",
          delta: { xp: 5, coins: 0 },
          resultText: "Problema: te faltó cubrir un gasto necesario (impresiones).",
        },
      ],
    },

    {
      id: "s4",
      type: "task",
      variant: "checklist",
      title: "Tu mini-plan",
      items: [
        { id: "i1", label: "Identifiqué mis ingresos (S/…)" },
        { id: "i2", label: "Separé gastos necesarios" },
        { id: "i3", label: "Definí un monto de ahorro/meta" },
        { id: "i4", label: "Recorté un gasto opcional si no alcanzaba" },
      ],
    },

    {
      id: "s5",
      type: "checkpoint",
      title: "Checkpoint",
      earned: { xp: 80, coins: 20, badgeId: "m01-a02p" },
      message:
        "Muy bien. Ya aplicaste el proceso.\n" +
        "Ahora veremos la parte actitudinal: hábitos y decisiones.",
    },
  ],
};
