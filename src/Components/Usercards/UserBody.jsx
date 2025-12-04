import React from "react";
import ModulePath from "../Modules/ModulePath";

const UserBody = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-max bg-lilac3">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Tu progreso de aprendizaje
      </h2>
      <p className="text-gray-600 mb-8">
        Explora los módulos de finanzas personales paso a paso.
      </p>
      <ModulePath />
    </div>
  );
};

export default UserBody;
