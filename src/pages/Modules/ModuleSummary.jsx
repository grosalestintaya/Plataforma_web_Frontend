import { Link, useParams } from "react-router-dom";
import { getModuleById } from "../../content/modules";

export default function ModuleSummary() {
  const { moduleId } = useParams();
  const mod = getModuleById(moduleId);

  if (!mod) return <p>Módulo no encontrado: {moduleId}</p>;

  return (
    <div>
      <h2>Resumen — {mod.title}</h2>
      <p>Aquí mostrarás progreso, XP ganado, insignias, etc.</p>

      <ul>
        {mod.activities.map((a) => (
          <li key={a.id}>
            {a.title} — XP: {a.xp}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16 }}>
        <Link to={`/modulos/${moduleId}`}>Volver al módulo</Link>
      </div>
    </div>
  );
}
