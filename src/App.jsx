import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Públicas
import NotFound from "./pages/NotFound/NotFoud";
import Introduction from "./pages/Introduction/Introduction";
import Login from "./pages/Login/Login";
import PrivateRoute from "./Components/auth/PrivateRoute.jsx";

// Layouts
import SideBar from "./layouts/SideBar";
import ModuleLayout from "./layouts/ModuleLayout";

// Dashboard
import Inicio from "./pages/DashBoard/Inicio";
import Perfil from "./pages/DashBoard/Perfil";
import Ranking from "./pages/DashBoard/Ranking";
import Ajustes from "./pages/DashBoard/Ajustes";
import LogOut from "./pages/DashBoard/LogOut";

// Admin / Teacher
import Users from "./pages/DashBoard/admin/Users.jsx";
import AddUsers from "./pages/DashBoard/admin/addUsers.jsx";
import GestSystem from "./pages/DashBoard/admin/gestSystem.jsx";
import Estadisticas from "./pages/DashBoard/teacher/statistics.jsx";
import Graficos from "./pages/DashBoard/teacher/graphs.jsx";
import Estudiantes from "./pages/DashBoard/teacher/Students.jsx";

// Manages
import ManageCollege from "./pages/DashBoard/admin/manage/manageCollege.jsx";
import ManageGrade from "./pages/DashBoard/admin/manage/manageGrade.jsx";
import ManageInsignia from "./pages/DashBoard/admin/manage/manageInsignia.jsx";
import ManageRol from "./pages/DashBoard/admin/manage/manageRol.jsx";

// Módulos (modo inmersivo, sin dashboard)
import ModuleOverview from "./pages/Modules/ModuleOverview.jsx";
import ActivityPlayerPage from "./pages/Modules/ActivityPlayerPage.jsx";
import ModuleSummary from "./pages/Modules/ModuleSummary.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/i" element={<Introduction />} />

        {/* Dashboard (Privado, CON SideBar) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <SideBar />
            </PrivateRoute>
          }
        >
          <Route index element={<Inicio />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="logout" element={<LogOut />} />

          <Route path="admin/users" element={<Users />} />
          <Route path="admin/add_user" element={<AddUsers />} />
          <Route path="admin" element={<GestSystem />} />

          <Route path="graphs" element={<Graficos />} />
          <Route path="statistics" element={<Estadisticas />} />
          <Route path="students" element={<Estudiantes />} />

          <Route path="manage_college" element={<ManageCollege />} />
          <Route path="manage_grade" element={<ManageGrade />} />
          <Route path="manage_insignia" element={<ManageInsignia />} />
          <Route path="manage_rol" element={<ManageRol />} />
        </Route>

        {/* MÓDULOS (Privado, SIN SideBar) */}
        <Route
          path="/modulos"
          element={
            <PrivateRoute>
              <ModuleLayout />
            </PrivateRoute>
          }
        >
          <Route path=":moduleId" element={<ModuleOverview />} />
          <Route
            path=":moduleId/actividades/:activityId"
            element={<ActivityPlayerPage />}
          />
          <Route path=":moduleId/resumen" element={<ModuleSummary />} />
        </Route>

        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
