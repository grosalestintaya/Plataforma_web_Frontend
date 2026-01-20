export default function EducaplayDemo() {
  const openLti = () => {
    window.open(
      "http://localhost:5000/api/lti/educaplay/launch",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <button onClick={openLti}>
      Abrir juego (EducaPlay LTI)
    </button>
  );
}
