import { Link, useParams } from "react-router-dom";
import { getActivity } from "../../content/modules";
import ActivityPlayer from "../../Components/activity-player/ActivityPlayer";

export default function ActivityPlayerPage() {
  const { moduleId, activityId } = useParams();
  const activity = getActivity(moduleId, activityId);

  if (!activity) {
    return (
      <div>
        <p>Actividad no encontrada: {moduleId}/{activityId}</p>
        <Link to={`/modulos/${moduleId}`}>Volver</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/modulos/${moduleId}`}>Volver al módulo</Link>
      </div>

      <ActivityPlayer moduleId={moduleId} activity={activity} />
    </div>
  );
}
