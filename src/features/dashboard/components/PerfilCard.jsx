import React from "react";
import { motion } from "framer-motion";

const PerfilCard = ({ user }) => {
  const profileImage = `/avatars/${user?.avatar || "default"}.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="w-full mt-4 rounded-3xl p-10 flex justify-between items-start border shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, var(--chip-bg), var(--ui-surface, #fff))",
        borderColor: "var(--card-border)",
      }}>
      {/* ========================= */}
      {/* DATOS DEL USUARIO         */}
      {/* ========================= */}
      <div className="w-2/3 grid grid-cols-2 gap-x-10 gap-y-5">
        <Field label="Fecha de registro" value={user.fechaRegistro} />
        <Field label="Nombre" value={user.nombre} />
        <Field label="Apellidos" value={user.apellidos} />
        <Field label="Usuario" value={`@${user.nombreUsuario}`} />
        <Field label="Colegio" value={user.colegio} />
        <Field label="Rol" value={user.rol} />
        <Field label="DNI" value={user.dni} />

        {/* Nota legal / informativa */}
        <div className="col-span-2 mt-6">
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: "var(--card-muted)" }}>
            La información del estudiante está protegida. Solo usuarios
            autorizados pueden visualizar estos datos.
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* AVATAR                   */}
      {/* ========================= */}
      <motion.div
        className="w-1/3 flex justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="relative">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40"
            style={{ backgroundColor: "var(--sidebar)" }}
          />

          <img
            src={profileImage}
            alt="Foto de perfil"
            className="relative w-44 h-44 object-cover rounded-full border-4 shadow-lg"
            style={{
              borderColor: "var(--sidebar)",
              backgroundColor: "var(--ui-surface, #fff)",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ========================= */
/* Sub-componente Field     */
/* ========================= */
const Field = ({ label, value }) => (
  <div>
    <p
      className="text-sm font-semibold mb-0.5"
      style={{ color: "var(--card-muted)" }}>
      {label}
    </p>
    <p
      className="text-lg font-medium leading-snug"
      style={{ color: "var(--card-text)" }}>
      {value}
    </p>
  </div>
);

export default PerfilCard;
