import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/components/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FREE_AVATARS = [
  {
    id_avatar: 1,
    key: "avatar_m_base",
    label: "Avatar base masculino",
    img: "/avatars/avatar_m_base.webp",
  },
  {
    id_avatar: 2,
    key: "avatar_f_base",
    label: "Avatar base femenino",
    img: "/avatars/avatar_f_base.webp",
  },
];

const styles = `

  .intro-root {
    min-height: 100vh;
    background: #00C853;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  /* ── TOP BAR con logo + steps + nav buttons ── */
  .intro-topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 18px 32px;
    background: rgba(0,0,0,0.12);
    border-bottom: 1px solid rgba(255,255,255,0.12);
    flex-wrap: wrap;
  }
  .intro-logo { height: 44px; flex-shrink: 0; cursor: pointer; transition: opacity 0.15s; }

  /* Steps strip */
  .intro-steps {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    flex: 1;
  }
  .intro-step {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s;
    border: 1.5px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.12);
  }
  .intro-step:hover { transform: translateY(-2px); background: rgba(255,255,255,0.2); }
  .intro-step-num {
    font-weight: 900;
    font-size: 20px;
    color: rgba(255,255,255,0.6);
  }
  .intro-step.active {
    background: #FFC400;
    border-color: #FFC400;
    transform: scale(1.08);
  }
  .intro-step.active .intro-step-num { color: #1A1100; }
  .intro-step.done {
    background: rgba(255,255,255,0.25);
    border-color: rgba(255,255,255,0.4);
  }
  .intro-step.done .intro-step-num { color: #fff; }
  .intro-step-connector {
    width: 20px; height: 2px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
  }
  .intro-step-connector.done-line { background: rgba(255,255,255,0.45); }

  /* ── Nav actions in topbar ── */
  .intro-topbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;
  }
  .intro-topbar-info {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.55);
    white-space: nowrap;
  }

  /* ── MAIN content ── */
  .intro-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px 80px;
  }

  /* Content card */
  .intro-card {
    background: rgba(0,0,0,0.16);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 28px;
    padding: 48px 52px;
    max-width: 680px;
    width: 100%;
    text-align: center;
    position: relative;
  }

  .intro-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px;
    padding: 5px 16px;
    font-size: 12px;
    font-weight: 800;
    color: rgba(255,255,255,0.75);
    margin-bottom: 24px;
    letter-spacing: 0.04em;
  }
  .intro-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #FFC400;
  }

  .intro-card-img {
    width: 220px;
    height: 220px;
    object-fit: contain;
    margin: 0 auto 32px;
    display: block;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25));
  }

  .intro-card-title {
    font-weight: 900;
    font-size: 42px;
    color: #fff;
    line-height: 1.05;
    margin-bottom: 18px;
  }

  .intro-card-text {
    font-size: 18px;
    color: rgba(255,255,255,0.78);
    line-height: 1.75;
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Avatar step ── */
  .intro-avatars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 28px;
  }
  .intro-avatar-btn {
    border-radius: 22px;
    border: 2px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
    padding: 20px 16px 18px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .intro-avatar-btn:hover {
    background: rgba(255,255,255,0.14);
    border-color: rgba(255,255,255,0.4);
    transform: translateY(-2px);
  }
  .intro-avatar-btn.selected {
    border-color: #FFC400;
    background: rgba(255,196,0,0.14);
  }
  .intro-avatar-img-wrap {
    width: 160px; height: 160px;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
  }
  .intro-avatar-img { width: 100%; height: 100%; object-fit: contain; }
  .intro-avatar-name {
    font-size: 15px;
    font-weight: 800;
    color: #fff;
  }
  .intro-avatar-hint {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
  }
  .intro-avatar-btn.selected .intro-avatar-hint {
    color: #FFC400;
  }
  .intro-avatar-check {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: #FFC400;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  /* ── Buttons ── */
  .intro-btn-back {
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    font-weight: 800;
    border-radius: 12px;
    padding: 11px 22px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .intro-btn-back:hover { background: rgba(255,255,255,0.2); }

  .intro-btn-next {
    background: #fff;
    color: #00A844;
    font-size: 15px;
    font-weight: 800;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .intro-btn-next:hover { opacity: 0.9; transform: translateY(-1px); }
  .intro-btn-next:disabled {
    background: rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.5);
    cursor: not-allowed;
    transform: none;
  }
  .intro-btn-finish {
    background: #FFC400;
    color: #1A1100;
    font-size: 15px;
    font-weight: 800;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .intro-btn-finish:hover { opacity: 0.88; }
  .intro-btn-finish:disabled { opacity: 0.45; cursor: not-allowed; }

  @media (max-width: 600px) {
    .intro-topbar { padding: 14px 16px; gap: 10px; }
    .intro-step { width: 44px; height: 44px; }
    .intro-step-num { font-size: 17px; }
    .intro-step-connector { width: 12px; }
    .intro-topbar-info { display: none; }
    .intro-card { padding: 28px 20px; border-radius: 20px; }
    .intro-card-title { font-size: 30px; }
    .intro-card-text { font-size: 16px; }
    .intro-card-img { width: 160px; height: 160px; }
    .intro-avatars { grid-template-columns: 1fr 1fr; gap: 10px; }
    .intro-avatar-img-wrap { width: 110px; height: 110px; }
  }
`;

const STEP_LABELS = [
  "Bienvenida",
  "Módulos",
  "Recompensas",
  "Ranking",
  "Avatar",
];

export default function Introduccion() {
  const navigate = useNavigate();
  const { activateUser } = useAuth();

  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  const cards = useMemo(
    () => [
      {
        id: 1,
        badge: "Paso 1 de 5",
        title: "Bienvenid@ a la plataforma",
        text: "Aquí aprenderás a manejar tus finanzas de forma divertida y educativa.",
        img: "/intro1.webp",
      },
      {
        id: 2,
        badge: "Paso 2 de 5",
        title: "Explora los módulos",
        text: "Cada módulo te enseñará un nuevo concepto financiero a través de retos interactivos.",
        img: "/intro2.webp",
      },
      {
        id: 3,
        badge: "Paso 3 de 5",
        title: "Gana puntos y medallas",
        text: "Completa actividades y gana recompensas mientras avanzas en tu aprendizaje.",
        img: "/intro3.webp",
      },
      {
        id: 4,
        badge: "Paso 4 de 5",
        title: "Compite en el ranking",
        text: "Comparte tus logros y compite con otros estudiantes para mejorar tu posición.",
        img: "/rank.webp",
      },
      {
        id: 5,
        badge: "Último paso",
        title: "Elige tu avatar",
        text: "Selecciona el avatar base con el que iniciarás tu aventura.",
        img: null,
        isAvatarStep: true,
      },
    ],
    [],
  );

  const isLastCard = currentCard === cards.length - 1;
  const currentStep = cards[currentCard];

  const handleActivateFlow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado. Inicia sesión primero.");
      return;
    }
    try {
      setLoading(true);
      const selectAvatarResponse = await fetch(
        `${BASE_URL}/api/select-initial`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_avatar: selectedAvatar }),
        },
      );
      if (!selectAvatarResponse.ok) {
        alert("No se pudo guardar el avatar inicial. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      const activateResponse = await fetch(`${BASE_URL}/api/user/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!activateResponse.ok) {
        alert("No se pudo activar la cuenta. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      activateUser();
      navigate("/");
    } catch (error) {
      console.error("Error en la activación inicial:", error);
      alert("Hubo un error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!isLastCard) {
      setCurrentCard((prev) => prev + 1);
      return;
    }
    await handleActivateFlow();
  };

  const handleBack = () => {
    if (currentCard > 0) setCurrentCard((prev) => prev - 1);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="intro-root">
        {/* ── TOP BAR ── */}
        <div className="intro-topbar">
          <img
            src="/logo.webp"
            alt="Quipu Yachay"
            className="intro-logo"
            onClick={() => navigate("/")}
          />
          <div className="intro-steps">
            {cards.map((card, index) => (
              <>
                {index > 0 && (
                  <div
                    key={`line-${index}`}
                    className={`intro-step-connector${index <= currentCard ? " done-line" : ""}`}
                  />
                )}
                <div
                  key={card.id}
                  className={`intro-step${
                    index === currentCard
                      ? " active"
                      : index < currentCard
                        ? " done"
                        : ""
                  }`}
                  onClick={() => {
                    if (!loading) setCurrentCard(index);
                  }}
                  title={STEP_LABELS[index]}>
                  <span className="intro-step-num">{card.id}</span>
                </div>
              </>
            ))}
          </div>

          {/* ── NAV ACTIONS (antes en el footer) ── */}
          <div className="intro-topbar-actions">
            {currentCard > 0 && (
              <button
                className="intro-btn-back"
                onClick={handleBack}
                disabled={loading}>
                ← Atrás
              </button>
            )}
            {!isLastCard ? (
              <button
                className="intro-btn-next"
                onClick={handleNext}
                disabled={loading}>
                Siguiente →
              </button>
            ) : (
              <button
                className="intro-btn-finish"
                onClick={handleNext}
                disabled={loading}>
                {loading ? "Procesando..." : "¡Comenzar!"}
              </button>
            )}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="intro-main">
          <div className="intro-card">
            <div className="intro-card-badge">
              <span className="intro-badge-dot" />
              {currentStep.badge}
            </div>

            {!currentStep.isAvatarStep && currentStep.img && (
              <img
                src={currentStep.img}
                alt={currentStep.title}
                className="intro-card-img"
              />
            )}

            <h2 className="intro-card-title">{currentStep.title}</h2>
            <p className="intro-card-text">{currentStep.text}</p>

            {currentStep.isAvatarStep && (
              <div className="intro-avatars">
                {FREE_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id_avatar;
                  return (
                    <button
                      key={avatar.id_avatar}
                      type="button"
                      className={`intro-avatar-btn${isSelected ? " selected" : ""}`}
                      onClick={() => setSelectedAvatar(avatar.id_avatar)}>
                      <div className="intro-avatar-img-wrap">
                        <img
                          src={avatar.img}
                          alt={avatar.label}
                          className="intro-avatar-img"
                        />
                      </div>
                      <span className="intro-avatar-name">{avatar.label}</span>
                      {isSelected ? (
                        <span className="intro-avatar-check">✓</span>
                      ) : (
                        <span className="intro-avatar-hint">
                          Haz clic para elegirlo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
