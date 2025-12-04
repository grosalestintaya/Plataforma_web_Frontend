import React, { useState } from "react";

const RankingTable = () => {
  const [topPlayers] = useState([
    { id: 1, name: "Andrés", level: 12, coins: 3400, avatar: "/avatars/1.png" },
    { id: 2, name: "Lucía", level: 11, coins: 3100, avatar: "/avatars/2.png" },
    { id: 3, name: "Mateo", level: 10, coins: 2800, avatar: "/avatars/3.png" },
    { id: 4, name: "Sofía", level: 9, coins: 2500, avatar: "/avatars/4.png" },
    { id: 5, name: "Diego", level: 8, coins: 2000, avatar: "/avatars/5.png" },
    { id: 6, name: "Camila", level: 7, coins: 1800, avatar: "/avatars/6.png" },
    { id: 7, name: "Valeria", level: 7, coins: 1500, avatar: "/avatars/1.png" },
  ]);

  const [currentUser] = useState({
    id: 10,
    name: "George",
    level: 6,
    coins: 1200,
    position: 12,
    avatar: "/avatars/2.png",
    role: "Estudiante",
    rankName: "Analista financiero",
    badges: ["/badges/1.png", "/badges/2.png", "/badges/3.png"],
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const activePlayer = selectedPlayer || currentUser;

  return (
    <div className="flex w-full h-full gap-6">
      {/* Tabla de Ranking */}
      <div className="flex-1 bg-white shadow rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-4">Top 7</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-gray-700">
              <th className="p-2">Puesto</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Nivel</th>
              <th className="p-2">Monedas</th>
            </tr>
          </thead>
          <tbody>
            {topPlayers.map((player, index) => (
              <tr
                key={player.id}
                className={`cursor-pointer hover:bg-gray-100 transition ${
                  index < 3 ? "bg-yellow-50" : ""
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <td className="p-3">
                  <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold clip-hex">
                    {index + 1}
                  </div>
                </td>
                <td className="p-3 flex items-center gap-2">
                  <img
                    src={player.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{player.name}</span>
                </td>
                <td className="p-3">Nivel {player.level}</td>
                <td className="p-3 flex items-center gap-1">
                  <span>{player.coins}</span>
                  <img
                    src="/icons/intis.png"
                    alt="moneda"
                    className="w-4 h-4"
                  />
                </td>
              </tr>
            ))}

            {/* Usuario actual (si no está en el top) */}
            {!topPlayers.some((p) => p.id === currentUser.id) && (
              <>
                <tr className="border-t border-gray-300">
                  <td
                    colSpan={4}
                    className="p-2 text-center text-sm text-gray-500"
                  >
                    Tu posición
                  </td>
                </tr>
                <tr
                  className="bg-blue-50 font-semibold cursor-pointer hover:bg-blue-100"
                  onClick={() => setSelectedPlayer(currentUser)}
                >
                  <td className="p-3">
                    <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold clip-hex">
                      {currentUser.position}
                    </div>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{currentUser.name}</span>
                  </td>
                  <td className="p-3">Nivel {currentUser.level}</td>
                  <td className="p-3 flex items-center gap-1">
                    <span>{currentUser.coins}</span>
                    <img
                      src="/icons/intis.png"
                      alt="moneda"
                      className="w-4 h-4"
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Card lateral del jugador */}
      <div className="w-[30%] bg-white shadow rounded-2xl p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Perfil</h2>
        <div className="relative">
          <img
            src={activePlayer.avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="font-bold text-lg">{activePlayer.name}</p>
          <p className="text-sm text-gray-500">{activePlayer.rankName}</p>
          <p className="text-sm text-gray-400">
            Posición #{activePlayer.position}
          </p>
        </div>
        <div className="mt-4 w-full">
          <h3 className="font-semibold text-gray-700 mb-2 text-center">
            Insignias
          </h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {activePlayer.badges.map((badge, i) => (
              <img key={i} src={badge} alt="insignia" className="w-8 h-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
