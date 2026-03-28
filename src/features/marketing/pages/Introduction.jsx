import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../shared/atoms/card";
import { Button } from "../../../shared/atoms/button";
import { useAuth } from "../../auth/components/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FREE_AVATARS = [
  {
    id_avatar: 1,
    key: "avatar_m_base",
    label: "Avatar base masculino",
    img: "/avatars/avatar_m_base.png",
  },
  {
    id_avatar: 2,
    key: "avatar_f_base",
    label: "Avatar base femenino",
    img: "/avatars/avatar_f_base.png",
  },
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
        title: "Bienvenid@ a la plataforma",
        text: "Aquí aprenderás a manejar tus finanzas de forma divertida y educativa.",
        img: "/intro1.png",
      },
      {
        id: 2,
        title: "Explora los módulos",
        text: "Cada módulo te enseñará un nuevo concepto financiero a través de retos interactivos.",
        img: "intro2.png",
      },
      {
        id: 3,
        title: "Gana puntos y medallas",
        text: "Completa actividades y gana recompensas mientras avanzas en tu aprendizaje.",
        img: "/intro3.png",
      },
      {
        id: 4,
        title: "Compite en el ranking",
        text: "Comparte tus logros y compite con otros estudiantes para mejorar tu posición.",
        img: "/intro4.png",
      },
      {
        id: 5,
        title: "Elige tu avatar inicial",
        text: "Antes de comenzar, selecciona el avatar base con el que iniciarás tu aventura.",
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

      // 1. Guardar avatar inicial
      const selectAvatarResponse = await fetch(
        `${BASE_URL}/api/select-initial`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_avatar: selectedAvatar,
          }),
        },
      );

      const selectAvatarData = await selectAvatarResponse.json();
      console.log("Respuesta select-initial:", selectAvatarData);

      if (!selectAvatarResponse.ok) {
        alert("No se pudo guardar el avatar inicial. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      // 2. Activar usuario
      const activateResponse = await fetch(`${BASE_URL}/api/user/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const activateData = await activateResponse.json();
      console.log("Respuesta activate:", activateData);

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

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-10">
      <img
        src="/logo_full.png"
        alt="Logo"
        className="absolute top-6 left-8 w-24 md:w-32"
      />

      {/* Cards numeradas */}
      <div className="flex flex-wrap justify-center gap-6 mb-10 max-w-8xl">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            onClick={() => {
              if (!loading) setCurrentCard(index);
            }}
            className={`flex flex-col items-center justify-center text-center cursor-pointer transition-all 
              w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px]
              rounded-2xl shadow-md border
              ${
                index === currentCard
                  ? "bg-blue-600 border-blue-700 text-white scale-105 shadow-xl"
                  : "bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300"
              }`}>
            <CardContent className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-semibold">{card.id}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative max-w-4xl w-full bg-white shadow-md rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          {currentStep.title}
        </h2>

        {!currentStep.isAvatarStep && currentStep.img && (
          <img
            src={currentStep.img}
            alt={currentStep.title}
            className="mx-auto mb-4 w-40 h-40 object-contain"
          />
        )}

        <p className="text-gray-600 text-base md:text-lg mb-6">
          {currentStep.text}
        </p>

        {currentStep.isAvatarStep && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {FREE_AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id_avatar;

              return (
                <button
                  key={avatar.id_avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id_avatar)}
                  className={`group rounded-2xl border-2 p-5 transition-all text-left ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden flex items-center justify-center mb-4 ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                      <img
                        src={avatar.img}
                        alt={avatar.label}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800">
                      {avatar.label}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {isSelected ? "Seleccionado" : "Haz clic para elegirlo"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón */}
      <div className="absolute top-4/5 right-10 transform -translate-y-1/2">
        <Button
          onClick={handleNext}
          disabled={loading}
          className={`text-lg px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}>
          {loading ? "Procesando..." : !isLastCard ? "Siguiente" : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
