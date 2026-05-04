export function moduleKeyToSortOrder(moduleKey) {
  const n = String(moduleKey || "").replace(/\D/g, "");
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

export function statusPriority(status) {
  if (status === "completed") return 3;
  if (status === "unlocked" || status === "in_progress") return 2;
  if (status === "locked") return 1;
  return 0;
}

export function pickModuleByKey(overviewModules, moduleKey) {
  const sortOrder = moduleKeyToSortOrder(moduleKey);
  if (!sortOrder) return null;

  const candidates = (overviewModules || []).filter(
    (module) => Number(module.sortOrder) === sortOrder,
  );

  if (!candidates.length) return null;

  return [...candidates].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pb !== pa) return pb - pa;

    const ca = Number(a.completedActivities || 0);
    const cb = Number(b.completedActivities || 0);
    if (cb !== ca) return cb - ca;

    return Number(b.moduleId || 0) - Number(a.moduleId || 0);
  })[0];
}

export function buildEffectiveActivities(moduleStatus, activities) {
  const list = [...(activities || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  if (moduleStatus === "locked") {
    return list.map((activity) =>
      activity.status === "completed"
        ? activity
        : { ...activity, status: "locked" },
    );
  }

  const effective = list.map((activity) => ({ ...activity }));

  const a1 = effective.find((x) => Number(x.sortOrder) === 1);
  const a2 = effective.find((x) => Number(x.sortOrder) === 2);
  const a3 = effective.find((x) => Number(x.sortOrder) === 3);

  if (a1 && a1.status !== "completed") a1.status = "unlocked";
  if (a2 && a1?.status === "completed" && a2.status !== "completed") {
    a2.status = "unlocked";
  }
  if (a3 && a2?.status === "completed" && a3.status !== "completed") {
    a3.status = "unlocked";
  }

  return effective;
}

export function getCtaLabel(activity) {
  if (!activity) return "-";
  if (activity.status === "completed") return "Nuevo intento";
  if (activity.status === "unlocked" || activity.status === "in_progress") {
    return "Realizar actividad";
  }
  return "Bloqueada";
}

// Utilidad para elegir un elemento random de un array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function getMascotText(activity) {
  // — Sin actividad seleccionada
  if (!activity) {
    return pick([
      "Selecciona una actividad para empezar.",
      "Elige algo y arrancamos.",
      "¿Por dónde quieres comenzar hoy?",
      "Toca una actividad y vamos juntos.",
      "Tu próximo paso financiero te está esperando.",
      "Cada actividad es un ladrillo de tu futuro económico.",
      "¿Listo para aprender algo nuevo sobre tu dinero?",
      "Elige y empecemos a construir tu educación financiera.",
      "El primer paso es elegir. ¿Cuál será el tuyo hoy?",
    ]);
  }

  // — Actividad bloqueada
  if (activity.status === "locked") {
    return pick([
      "Aún no. Completa la actividad anterior y volvemos.",
      "Esta todavía no es tuya. Sigue el camino.",
      "Primero lo primero. Hay una actividad esperando antes que esta.",
      "Paciencia. Desbloquéala completando lo anterior.",
      "El orden importa, igual que en las finanzas. Paso a paso.",
      "Esta puerta aún está cerrada. Termina lo anterior y se abre.",
      "No hay atajos en la educación financiera. Sigue la ruta.",
      "Casi. Completa lo anterior y esta será tuya.",
      "Las bases primero. Sin ellas, nada de lo que sigue tiene sentido.",
    ]);
  }

  // — Score perfecto con tipo anidado
  if (activity.bestScore === 100) {
    if (activity.type === "conceptual") {
      return pick([
        "¡100 en conceptual! Ya tienes el mapa mental completo. Ahora a aplicarlo.",
        "Perfecta comprensión. Entender el dinero es el primer gran paso.",
        "Dominaste la teoría. Eso es poder: saber exactamente qué estás haciendo con tu plata.",
        "100 puntos en conceptual. Pocos entienden esto tan bien como tú ahora.",
        "La teoría financiera ya es tuya. Lo que sigue es ponerla en práctica.",
        "Perfecto. Ahora cuando alguien hable de esto, tú sabrás exactamente de qué va.",
        "Máximo puntaje. Eso significa que entiendes el concepto de raíz, no de memoria.",
        "¡100! Esto no se memoriza, se entiende. Y tú lo entendiste.",
        "Base sólida. Con este conocimiento, las decisiones financieras empiezan a tener otra lógica.",
      ]);
    }

    if (activity.type === "procedimental") {
      return pick([
        "¡100 en práctica! Ya no solo sabes cómo funciona, sabes cómo hacerlo.",
        "Perfecto en procedimental. Tus manos ya saben lo que tu cabeza aprendió.",
        "Máximo puntaje. Esto significa que puedes ejecutarlo en la vida real.",
        "¡100! De saber a poder hacer hay un abismo. Tú ya cruzaste ese puente.",
        "Ejecución impecable. En finanzas, saber hacer marca toda la diferencia.",
        "Perfecto. Ahora esto no es solo conocimiento, es una habilidad tuya.",
        "¡100 en procedimental! El músculo financiero se entrena así, exactamente así.",
        "Dominaste el proceso. Repítelo en tu vida y los resultados van a aparecer solos.",
        "Máxima puntuación. Ya tienes la herramienta afilada. Ahora úsala.",
      ]);
    }

    if (activity.type === "actitudinal") {
      return pick([
        "¡100 en actitudinal! La actitud correcta frente al dinero lo cambia absolutamente todo.",
        "Perfecto. No es solo saber, es querer actuar diferente. Y tú ya lo estás haciendo.",
        "Máximo puntaje en algo que va más allá de las finanzas: tu mentalidad.",
        "¡100! La relación sana con el dinero empieza exactamente aquí, en la actitud.",
        "Impecable. Muy poca gente trabaja su mentalidad financiera. Tú sí.",
        "Perfecto en actitudinal. Eso significa que estás listo para decidir diferente.",
        "¡100! No hay fórmula mágica, hay actitud consistente. Ya la tienes.",
        "Máximo puntaje. Lo que aprendiste hoy puede cambiar cómo manejas tu plata para siempre.",
        "Brillante. El cambio financiero real empieza con el cambio de mentalidad. Ya lo lograste.",
      ]);
    }

    // — 100 sin tipo específico
    return pick([
      "¡100! Eso no se logra sin esfuerzo real. Chapeau.",
      "Perfecto. Literal. Nada que agregar.",
      "Máximo puntaje. Ya eres dueño de esta actividad.",
      "¡100 puntos! Podrías enseñar esto tú mismo.",
      "Impecable. Cuando quieras, puedes repetirla y seguir brillando.",
      "Perfección financiera. Así se construye el conocimiento sólido.",
      "¡100! Cada punto de estos es un paso hacia tu libertad financiera.",
      "Máximo. Eso significa que no solo pasaste, sino que realmente aprendiste.",
      "Sin errores. Así se domina la educación financiera: con dedicación real.",
    ]);
  }

  // — Completada sin score perfecto
  if (activity.status === "completed") {
    return pick([
      "Ya la completaste. ¿Te animas a mejorar tu puntaje?",
      "Bien hecho. Pero siempre hay margen para más.",
      "Completada. Intenta otra vez y supérate.",
      "La terminaste. ¿Qué tal si apuntas al 100 esta vez?",
      "Buen trabajo. En finanzas siempre hay algo más que aprender aquí.",
      "Completada, pero el 100 todavía está disponible. ¿Lo vas a dejar ir?",
      "Ya pasaste. Ahora viene la diferencia entre aprender y dominar.",
      "Terminada. Una segunda vuelta siempre revela algo que se escapó la primera vez.",
      "Bien. Recuerda: en educación financiera, repasar no es perder el tiempo, es invertirlo.",
    ]);
  }

  // — En progreso
  if (activity.status === "in_progress") {
    return pick([
      "Ya empezaste esto. ¡Termínalo hoy!",
      "A medias queda lindo pero terminada queda mejor.",
      "Estás en camino. Un empujón más y listo.",
      "Retomemos donde lo dejaste. Casi llegas.",
      "Lo empezaste, no lo abandones. En finanzas, la constancia es todo.",
      "Estás más cerca de terminar que de empezar. Sigue.",
      "Media actividad no te da medio conocimiento. Termínala.",
      "Cada minuto que le dediques a esto es una inversión en ti.",
      "Ya arrancaste, eso es lo más difícil. El resto es inercia. Vamos.",
    ]);
  }

  // — Por tipo de actividad (sin completar)
  if (activity.type === "conceptual") {
    return pick([
      "Aquí construimos la idea base. Lee con calma.",
      "Primero entender, después hacer. Tómate el tiempo.",
      "Este es el mapa. Léelo bien antes de caminar.",
      "Sin teoría, la práctica financiera es a ciegas. Vamos despacio.",
      "Entiende el concepto y las decisiones financieras empiezan a fluir solas.",
      "La base conceptual es el cimiento. Sin ella, todo tambalea.",
      "Lee, reflexiona, conecta. Así se construye el conocimiento real.",
      "No memorices: entiende. Hay una gran diferencia en finanzas.",
      "Este concepto va a aparecer en tu vida real más seguido de lo que crees.",
    ]);
  }

  if (activity.type === "procedimental") {
    return pick([
      "Hora de practicar. Prueba y mejora.",
      "Las manos a la obra. Equivocarse aquí es parte del juego.",
      "Aprende haciendo. No hay otra forma.",
      "Practica, falla, ajusta. Así funciona esto.",
      "En finanzas, saber hacer vale más que solo saber.",
      "Cada intento te acerca más a ejecutarlo en tu vida real.",
      "El error aquí no cuesta. El error en tu bolsillo, sí. Practica.",
      "Procedimental significa que vas a salir de acá sabiendo hacer algo concreto.",
      "La habilidad financiera se entrena, no se nace con ella. Vamos.",
    ]);
  }

  if (activity.type === "actitudinal") {
    return pick([
      "Piensa en tu vida diaria: decide con intención.",
      "¿Cómo aplicarías esto mañana? Reflexiona.",
      "Esto va más allá del puntaje. Conecta con tu realidad.",
      "No hay respuesta correcta, hay respuesta tuya. Sé honesto.",
      "La actitud frente al dinero determina más que cualquier técnica.",
      "Tus creencias sobre el dinero moldean tus decisiones. Trabájalas.",
      "Este tipo de actividad cambia más que el puntaje: cambia perspectivas.",
      "Reflexiona de verdad. Las respuestas apresuradas no generan cambio real.",
      "La inteligencia financiera empieza por la honestidad contigo mismo.",
    ]);
  }

  // — Fallback genérico
  return pick([
    "Dale. En esta actividad avanzaremos paso a paso.",
    "Cada actividad te acerca más. Vamos.",
    "Un paso a la vez. Tú puedes con esto.",
    "Arranquemos. Lo que empieza, termina.",
    "Tu futuro financiero se construye hoy, con decisiones como esta.",
    "Pequeños pasos, grandes cambios. Empecemos.",
    "Esto no es un gasto de tiempo, es una inversión en ti.",
    "El conocimiento financiero que ganas hoy nadie te lo puede quitar.",
    "Cada actividad completada es una deuda menos con tu yo futuro.",
  ]);
}
