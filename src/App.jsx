import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import SideBar from "./layouts/SideBar";

// Páginas principales
import NotFound from "./pages/NotFound/NotFoud";
import Introduction from "./pages/Introduction/Introduction";
import Login from "./pages/Login/Login";
import PrivateRoute from "./Components/auth/PrivateRoute.jsx";

// Páginas del Dashboard
import Inicio from "./pages/DashBoard/Inicio";
import Perfil from "./pages/DashBoard/Perfil";
import Ranking from "./pages/DashBoard/Ranking";
import Ajustes from "./pages/DashBoard/Ajustes";
import LogOut from "./pages/DashBoard/LogOut";
import Users from "./pages/DashBoard/admin/Users.jsx";
import AddUsers from "./pages/DashBoard/admin/addUsers.jsx";
import Estadisticas from "./pages/DashBoard/teacher/statistics.jsx";
import Graficos from "./pages/DashBoard/teacher/graphs.jsx";
import Estudiantes from "./pages/DashBoard/teacher/Students.jsx";
import GestSystem from "./pages/DashBoard/admin/gestSystem.jsx";
// --------------------- manages----------------------
import ManageCollege from "./pages/DashBoard/admin/manage/manageCollege.jsx";
import ManageGrade from "./pages/DashBoard/admin/manage/manageGrade.jsx";
import ManageInsignia from "./pages/DashBoard/admin/manage/manageInsignia.jsx";
import ManageRol from "./pages/DashBoard/admin/manage/manageRol.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/i" element={<Introduction />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <SideBar />
            </PrivateRoute>
          }>
          <Route index element={<Inicio />} />

          <Route path="perfil" element={<Perfil />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="logout" element={<LogOut />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/add_user" element={<AddUsers />} />

          <Route path="/graphs" element={<Graficos />} />
          <Route path="/statistics" element={<Estadisticas />} />
          <Route path="/students" element={<Estudiantes />} />
          <Route path="/admin" element={<GestSystem />} />
          {/* / rutas manejo de rolesrados ,ect..s */}
          <Route path="/manage_college" element={<ManageCollege />} />
          <Route path="/manage_grade" element={<ManageGrade />} />
          <Route path="/manage_insignia" element={<ManageInsignia />} />
          <Route path="/manage_rol" element={<ManageRol />} />

        </Route>

        {/* Módulos externos */}
        <Route path="/Module_1" element={<div>Contenido módulo 1</div>} />
        <Route path="/Module_2" element={<div>Contenido módulo 2</div>} />
        <Route path="/Module_3" element={<div>Contenido módulo 3</div>} />
        <Route path="/Module_4" element={<div>Contenido módulo 4</div>} />
        <Route path="/Module_5" element={<div>Contenido módulo 5</div>} />
        <Route path="/Module_6" element={<div>Contenido módulo 6</div>} />

        {/* Página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
