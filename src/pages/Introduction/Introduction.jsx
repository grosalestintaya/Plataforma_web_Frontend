import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Introduccion() {
  const navigate = useNavigate();
  const { activateUser } = useAuth();

  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);

  const cards = [
    {
      id: 1,
      title: "Bienvenido a la plataforma",
      text: "Aquí aprenderás a manejar tus finanzas de forma divertida y educativa.",
      img: "/assets/logo.jpg",
    },
    {
      id: 2,
      title: "Explora los módulos",
      text: "Cada módulo te enseñará un nuevo concepto financiero a través de retos interactivos.",
      img: "/assets/intro2.png",
    },
    {
      id: 3,
      title: "Gana puntos y medallas",
      text: "Completa actividades y gana recompensas mientras avanzas en tu aprendizaje.",
      img: "/assets/intro3.png",
    },
    {
      id: 4,
      title: "Compite en el ranking",
      text: "Comparte tus logros y compite con otros estudiantes para mejorar tu posición.",
      img: "/assets/intro4.png",
    },
    {
      id: 5,
      title: "Comencemos tu aventura",
      text: "Ahora estás listo para comenzar. ¡Prepárate para aprender y divertirte!",
      img: "/assets/intro5.png",
    },
  ];

  const handleNext = async () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard((c) => c + 1);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado. Inicia sesión primero.");
        setLoading(false);
        return;
      }

      const response = await fetch(BASE_URL+"/api/user/activate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      console.log("Respuesta activate:", resData);

      if (!response.ok) {
        alert("No se pudo activar la cuenta. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      activateUser();
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error("Error en la activación:", err);
      alert("Hubo un error de conexión.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-10">
      
      {/* Logo flotante */}
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="absolute top-6 left-8 w-24 md:w-32"
      />

      {/* Cards numeradas */}
      <div className="flex flex-wrap justify-center gap-6 mb-10 max-w-8xl">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            onClick={() => setCurrentCard(index)}
            className={`flex flex-col items-center justify-center text-center cursor-pointer transition-all 
              w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px]
              rounded-2xl shadow-md border
              ${
                index === currentCard
                  ? "bg-blue-600 border-blue-700 text-white scale-105 shadow-xl"
                  : "bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300"
              }`}
          >
            <CardContent className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-semibold">{card.id}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenido dinámico */}
      <div className="relative max-w-3xl w-full bg-white shadow-md rounded-2xl p-6 md:p-10">
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          {cards[currentCard].title}
        </h2>
        {cards[currentCard].img && (
          <img
            src={cards[currentCard].img}
            alt={cards[currentCard].title}
            className="mx-auto mb-4 w-40 h-40 object-contain"
          />
        )}
        <p className="text-gray-600 text-base md:text-lg">
          {cards[currentCard].text}
        </p>

        {/* Botón a la derecha, dentro del card */}
     
      </div>
         <div className="absolute top-4/5 right-10 transform -translate-y-1/2">
          <Button
            onClick={handleNext}
            disabled={loading}
            className={`text-lg px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading
              ? "Procesando..."
              : currentCard < cards.length - 1
              ? "Siguiente"
              : "Finalizar"}
          </Button>
        </div>
    </div>
  );
}
