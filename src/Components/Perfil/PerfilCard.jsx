import React from "react";
import { motion } from "framer-motion";

const PerfilCard = ({ user }) => {
const profileImage = `/profile/${user?.avatar || "default"}.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="w-full h-full mt-6 rounded-3xl shadow-xl p-10 bg-gradient-to-br from-white to-gray-100 backdrop-blur-lg border border-gray-200 flex justify-between items-start"
    >
      {/* Datos del usuario */}
      <div className="w-2/3 grid grid-cols-2 gap-y-5 gap-x-10 text-gray-800">
        <div>
          <p className="font-semibold text-gray-600">Fecha de Registro:</p>
          <p className="text-lg font-medium">{user.fechaRegistro}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">Nombre:</p>
          <p className="text-lg font-medium">{user.nombre}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">Apellidos:</p>
          <p className="text-lg font-medium">{user.apellidos}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">Nombre de Usuario:</p>
          <p className="text-lg font-medium">{user.nombreUsuario}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">Colegio:</p>
          <p className="text-lg font-medium">{user.colegio}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">Rol:</p>
          <p className="text-lg font-medium">{user.rol}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600">DNI:</p>
          <p className="text-lg font-medium">{user.dni}</p>
        </div>

        <div className="col-span-2 mt-6">
          <p className="text-sm text-gray-500 italic">
            La información del estudiante está protegida. Solo usuarios autorizados pueden visualizar estos datos.
          </p>
        </div>
      </div>

      {/* Imagen del usuario */}
      <motion.div
        className="w-1/3 flex justify-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <motion.img
          src={profileImage}
          alt="Foto de perfil"
          className="w-44 h-44 object-cover rounded-full border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.2)]"
          whileHover={{ scale: 1.08, rotate: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default PerfilCard;
