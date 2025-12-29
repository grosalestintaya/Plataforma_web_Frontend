import { Link, useParams } from "react-router-dom";
import { getModuleById } from "../../content/modules";

export default function ModuleOverview() {
  const { moduleId } = useParams();
  const mod = getModuleById(moduleId);

  if (!mod) return <p>Módulo no encontrado: {moduleId}</p>;

  return (
    <div>
      <h2>{mod.title}</h2>
      <p>{mod.description}</p>

      <h3>Actividades</h3>
      <ol>
        {mod.activities.map((a) => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            <Link to={`/modulos/${mod.id}/actividades/${a.id}`}>
              {a.title} ({a.kind})
            </Link>
          </li>
        ))}
      </ol>

      <div style={{ marginTop: 16 }}>
        <Link to={`/modulos/${mod.id}/resumen`}>Ver resumen del módulo</Link>
      </div>
    </div>
  );
}
