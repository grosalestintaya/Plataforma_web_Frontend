import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout principal del dashboard (barra lateral + outlet)
import SideBar from "./features/dashboard/layouts/SideBar.jsx";
// Páginas principales
import NotFound from "./features/system/pages/NotFoud.jsx";
import Introduction from "./features/marketing/pages/Introduction.jsx";
import Login from "./features/auth/pages/Login.jsx";
import LandingPage from "./features/marketing/pages/LandingPage.jsx";
// Guards
import PublicRoute from "./features/auth/components/PublicRoute.jsx";
import PrivateRoute from "./features/auth/components/PrivateRoute.jsx";
// Páginas del Dashboard
import Inicio from "./features/dashboard/pages/shared/Inicio.jsx";
import Perfil from "./features/dashboard/pages/shared/Perfil.jsx";
import Ranking from "./features/dashboard/pages/shared/Ranking.jsx";
import Ajustes from "./features/dashboard/pages/shared/Ajustes.jsx";
import LogOut from "./features/auth/pages/LogOut.jsx";
import Users from "./features/dashboard/pages/admin/Users.jsx";
import AddUsers from "./features/dashboard/pages/admin/addUsers.jsx";
import GestSystem from "./features/dashboard/pages/admin/gestSystem.jsx";
import Estadisticas from "./features/dashboard/pages/teacher/statistics.jsx";
import Graficos from "./features/dashboard/pages/teacher/graphs.jsx";
import Estudiantes from "./features/dashboard/pages/teacher/GradeStudents.jsx";
// --------------------- manages----------------------
import ManageCollege from "./features/dashboard/pages/admin/manage/manageCollege.jsx";
import ManageGrade from "./features/dashboard/pages/admin/manage/manageGrade.jsx";
import ManageInsignia from "./features/dashboard/pages/admin/manage/manageInsignia.jsx";
import ManageRol from "./features/dashboard/pages/admin/manage/manageRol.jsx";
import TeacherGrades from "./features/dashboard/pages/teacher/TeacherGrades.jsx";
import GradeStudents from "./features/dashboard/pages/teacher/GradeStudents.jsx";
import StudentDetails from "./features/dashboard/pages/teacher/StudentDetails.jsx";
import Store from "./features/dashboard/pages/shared/Store.jsx";
import HeatMap from "./features/dashboard/pages/shared/heatMap.jsx";
import ModuleMenuPage from "./features/modules/pages/ModuleMenuPage.jsx";

import ModuleFrame from "./features/module/components/ModuleFrame.jsx";
import ActivityPlayerPage from "./features/activities/pages/ActivityPlayerPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============ RUTAS PÚBLICAS (Opción B) ============ */}
        {/* / => Landing si NO hay sesión; si hay sesión, PrivateRoute lo toma */}
        <Route
          path="/"
          element={
            <PublicRoute redirectTo="/app">
              <LandingPage />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute redirectTo="/app">
              <Login />
            </PublicRoute>
          }
        />

        <Route path="/i" element={<Introduction />} />

        {/* ============ APP PRIVADA (Dashboard) ============ */}
        {/* Montamos la app privada en /app para separar bien público vs privado */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <SideBar />
            </PrivateRoute>
          }>
          {/* /app */}
          <Route index element={<Inicio />} />

          {/* /app/perfil, etc */}
          <Route path="perfil" element={<Perfil />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="logout" element={<LogOut />} />
          <Route path="store" element={<Store />} />

          {/* admin */}

          <Route path="users" element={<Users />} />
          <Route path="add_user" element={<AddUsers />} />
          <Route path="admin" element={<GestSystem />} />

          {/* teacher */}
          <Route path="teacher/graphs" element={<Graficos />} />
          <Route path="teacher/statistics" element={<Estadisticas />} />
          <Route path="teacher/heatmap" element={<HeatMap />} />

          {/* manage */}
          <Route path="manage/college" element={<ManageCollege />} />
          <Route path="manage/grade" element={<ManageGrade />} />
          <Route path="manage/insignia" element={<ManageInsignia />} />
          <Route path="manage/rol" element={<ManageRol />} />

          <Route path="teacher/students" element={<TeacherGrades />} />
          <Route
            path="teacher/students/:id_grade"
            element={<GradeStudents />}
          />
          <Route
            path="teacher/students/view/:id_user"
            element={<StudentDetails />}
          />
        </Route>

        {/* ============ MÓDULOS EXTERNOS ============ */}
        {/* Recomiendo protegerlos también */}

        <Route
          path="student/modules/1"
          element={
            <PrivateRoute>
              <div>Contenido módulo 1</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/Module_3"
          element={
            <PrivateRoute>
              <div>Contenido módulo 3</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/Module_4"
          element={
            <PrivateRoute>
              <div>Contenido módulo 4</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/Module_5"
          element={
            <PrivateRoute>
              <div>Contenido módulo 5</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/Module_6"
          element={
            <PrivateRoute>
              <div>Contenido módulo 6</div>
            </PrivateRoute>
          }
        />

        {/* RUTA PARA LOS MODULOS */}
        {/* <Route path="/modules/:moduleKey" element={<ModuleMenuPage />} /> */}
        <Route path="/modules/:moduleCode" element={<ModuleMenuPage />} />

        <Route
          path="/modules/:moduleCode/:missionKey"
          element={<ModuleFrame />}
          // path="/play/:moduleCode/:activityCode"
          // element={<ActivityPlayerPage />}
        />
        {/* FIN RUTA PARA LOS MODULOS */}

        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* Página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
