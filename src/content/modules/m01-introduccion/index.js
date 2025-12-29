import a01 from "./activities/a01c";
import a02 from "./activities/a02p";
import a03 from "./activities/a03a";

export default {
  id: "m01",
  slug: "m01-introduccion",
  title: "Módulo 1: Introducción",
  description: "Bases de la educación financiera.",
  order: 1,
  unlockRule: null, // o { xpRequired: 100 }
  activities: [a01, a02, a03],
};
