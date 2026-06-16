export const TOUR_FLOW = [
  {
    id: "welcome",
    route: "/app",
    steps: [
      {
        selector: null, // ← sin selector = centrado
        title: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0">
          <img src="/src/assets/mascots/colibri.gif" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.4))" />
          <span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.01em">¡Bienvenid@ a Quipu Yachay!</span>
        </div>`,
        text: "Soy tu guía en esta aventura financiera. En los próximos pasos te mostraré todo lo que puedes hacer aquí. ¡Empecemos! ",
      },
    ],
  },
  {
    id: "dashboard",
    route: "/app",
    steps: [
      // ... tus pasos existentes
    ],
  },
  {
    id: "dashboard",
    route: "/app",
    steps: [
      {
        selector: "#nav-bar",
        title: "Barra de navegación",
        text: "esta es la barra de navegacion , desde aqui cambiaras entre las vistas disponibles.",
      },
      {
        selector: "#nav-inicio",
        title: "🏠 Inicio",
        text: "Tu punto de partida.esta es la ventana principal donde puedes acceder a tus módulos, estadísticas y más.",
      },
      {
        selector: "#main-rope",
        title: "Modulos",
        text: "Aquí accedes a todos tus módulos de aprendizaje, cada cuerda es un modulo.",
      },
      {
        selector: "#last-module-panel",
        title: "Último módulo",
        text: "Aquí puedes ver el progreso para desbloquear el modulo final.",
      },
      {
        selector: "#nav-user",
        title: "stats",
        text: "Visualiza tus  datos , puntos de xp , Intis ganados y progreso general .",
      },
      {
        selector: "#nav-insignias",
        title: "Insignias",
        text: "Visualiza tu progreso de insignias desbloqueadas . puedes hacer click en ellas para ver los requisitos y detalles de cada una.",
      },
    ],
  },
  {
    id: "store",
    route: "/app/store",
    steps: [
      {
        selector: "#store-nav",
        title: "🛍️ monedas disponibles",
        text: "Visualiza tus Intis disponibles para gastar en la tienda. Ganas Intis completando actividades y módulos.",
      },
      {
        selector: "#store-items",
        title: "🛍️ Avatares disponibles",
        text: "Explora los avatares. Cada uno se compra con los Intis que ganas completando actividades.",
      },
    ],
  },
  {
    id: "Ranking",
    route: "/app/ranking",
    steps: [
      {
        selector: "#ranking-nav",
        title: "Tu posición en el ranking",
        text: "Visualiza tu posición en el ranking de usuarios. Compite con otros jugadores para alcanzar la cima.",
      },
      {
        selector: "#ranking-list",
        title: "🏆 Ranking",
        text: "Aquí puedes ver a los usuarios en el ranking, sus puntos y posiciones. ¡Es tu oportunidad de brillar y subir en la clasificación! ",
      },
    ],
  },
  {
    id: "profile",
    route: "/app/perfil",
    steps: [
      {
        selector: "#nav-profile",
        title: "👤 Perfil ",
        text: "Aquí puedes ver tus datos , editar tus credenciales y repetir el tour si lo deseas. ",
      },
      {
        selector: "#edit-avatar",
        title: "Cambiar de  avatar",
        text: "En esta sección puedes cambiar tu avatar. Elige entre los avatares que has desbloqueado en la tienda para personalizar tu perfil.",
      },
      {
        selector: "#personalization-options",
        title: "Cambiar estilo de visualización",
        text: "Cambia entre los colores para adaptar la apariencia a tu preferencia.haz que la plataforma se sienta tuya.",
      },
    ],
  },
  {
    id: "finish",
    route: "/app",
    steps: [
      {
        selector: null, // ← sin selector = centrado
        title: `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0">
          <img src="/src/assets/mascots/colibri.gif" style="width:160px;height:160px;object-fit:contain;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.4))" />
          <span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.01em">¡Terminamos!</span>
        </div>`,
        text: "Creo que ya viste todo lo que tenías que ver , puedes repetir el tour si lo deseas. ¡hasta las vista! ",
      },
    ],
  },
];
