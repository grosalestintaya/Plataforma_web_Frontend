import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white text-center p-6">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
        404
      </h1>

      <h2 className="mt-4 text-3xl font-semibold">Página no encontrada</h2>
      <p className="mt-2 text-gray-400 max-w-md">
        Lo sentimos, la página que estás buscando no existe o fue movida.
      </p>

      <Link
        to="/"
        className="mt-8 inline-block px-6 py-3 text-lg font-medium bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-2xl shadow-md transition-all duration-200"
      >
        Volver al inicio
      </Link>

      <div className="mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} — Quipus
      </div>
    </div>
  );
}
