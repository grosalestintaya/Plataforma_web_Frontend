// src/layout/onboarding.config.js
export const ONBOARDING_BY_ROLE = {
  Estudiante: {
    storageKey: "onboarding_estudiante_v1",
    steps: [
      {
        popover: {
          title: "👋 ¡Bienvenido a Quipu Yachay!",
          description:
            "Aprende sobre finanzas de forma divertida. Te mostramos cómo funciona la plataforma.",
        },
      },
      {
        element: "#nav-inicio",
        popover: {
          title: "🏠 Inicio",
          description:
            "Desde aquí accedes a tus módulos. Cada módulo es un nudo en tu quipu del saber.",
          side: "right",
        },
      },
      {
        element: "#nav-store",
        popover: {
          title: "🛒 Tienda",
          description:
            "Gasta tus Intis aquí. Desbloquea avatares y recompensas completando actividades.",
          side: "right",
        },
      },
      {
        element: "#nav-ranking",
        popover: {
          title: "🏆 Ranking",
          description:
            "Compite con tus compañeros de clase. ¿Puedes llegar al primer puesto?",
          side: "right",
        },
      },
      {
        element: "#nav-perfil",
        popover: {
          title: "👤 Tu Perfil",
          description:
            "Aquí ves tus Intis, XP, nivel y logros. ¡Todo lo que has ganado estará aquí!",
          side: "right",
        },
      },
      {
        popover: {
          title: "🎉 ¡Todo listo!",
          description:
            "El saber, como el quipu, se construye nudo a nudo. ¡Mucho éxito!",
        },
      },
    ],
  },

  Docente: {
    storageKey: "onboarding_docente_v1",
    steps: [
      {
        popover: {
          title: "👋 ¡Bienvenido, Docente!",
          description:
            "Desde aquí gestionas el progreso de tus estudiantes. Te explicamos cada sección.",
        },
      },
      {
        element: "#nav-general",
        popover: {
          title: "📊 General",
          description:
            "Vista general del progreso de tu aula en forma de mapa de calor.",
          side: "right",
        },
      },
      {
        element: "#nav-estudiantes",
        popover: {
          title: "👥 Estudiantes",
          description:
            "Gestiona tu lista de estudiantes, revisa su avance individual y sus credenciales.",
          side: "right",
        },
      },
      {
        element: "#nav-modulos",
        popover: {
          title: "📚 Módulos",
          description:
            "Controla qué módulos están activos para tu clase y el modo de desbloqueo.",
          side: "right",
        },
      },
      {
        element: "#nav-estadisticas",
        popover: {
          title: "📈 Estadísticas",
          description:
            "Métricas detalladas de rendimiento por actividad y por estudiante.",
          side: "right",
        },
      },
      {
        popover: {
          title: "✅ ¡Listo para enseñar!",
          description:
            "Ya conoces las herramientas. Puedes repetir este tour desde tu perfil cuando quieras.",
        },
      },
    ],
  },

  Administrador: {
    storageKey: "onboarding_admin_v1",
    steps: [
      {
        popover: {
          title: "👋 Panel de Administrador",
          description: "Desde aquí controlas toda la plataforma.",
        },
      },
      {
        element: "#nav-usuarios",
        popover: {
          title: "👥 Usuarios",
          description:
            "Lista completa de usuarios: estudiantes, docentes y admins.",
          side: "right",
        },
      },
      {
        element: "#nav-agregar",
        popover: {
          title: "➕ Agregar",
          description:
            "Crea nuevos usuarios o realiza inserciones masivas con CSV.",
          side: "right",
        },
      },
    ],
  },
};
