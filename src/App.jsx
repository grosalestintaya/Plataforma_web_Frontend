import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import SideBar from "./layouts/SideBar";

// Páginas principales
import NotFound from "./pages/NotFound/NotFoud";
import Introduction from "./pages/Introduction/Introduction";
import Login from "./pages/Login/Login";
import LandingPage from "./pages/Landing/LandingPage";

// Guards
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import PublicRoute from "./components/auth/PublicRoute.jsx";

// Páginas del Dashboard
import Inicio from "./pages/DashBoard/Inicio";
import Perfil from "./pages/DashBoard/Perfil";
import Ranking from "./pages/DashBoard/Ranking";
import Ajustes from "./pages/DashBoard/Ajustes";
import LogOut from "./pages/DashBoard/LogOut";

import Users from "./pages/DashBoard/admin/Users.jsx";
import AddUsers from "./pages/DashBoard/admin/addUsers.jsx";
import GestSystem from "./pages/DashBoard/admin/gestSystem.jsx";

import Estadisticas from "./pages/DashBoard/teacher/statistics.jsx";
import Graficos from "./pages/DashBoard/teacher/graphs.jsx";
import Estudiantes from "./pages/DashBoard/teacher/Students.jsx";

// --------------------- manages----------------------
import ManageCollege from "./pages/DashBoard/admin/manage/manageCollege.jsx";
import ManageGrade from "./pages/DashBoard/admin/manage/manageGrade.jsx";
import ManageInsignia from "./pages/DashBoard/admin/manage/manageInsignia.jsx";
import ManageRol from "./pages/DashBoard/admin/manage/manageRol.jsx";
import TeacherGrades from "./pages/DashBoard/teacher/TeacherGrades.jsx";
import GradeStudents from "./pages/DashBoard/teacher/GradeStudents.jsx";
import StudentDetails from "./pages/DashBoard/teacher/StudentDetails.jsx";
import Store from "./pages/DashBoard/Store.jsx";

 import HeatMap from "./pages/DashBoard/heatMap.jsx";
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
          }
        >
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
           <Route path="teacher/students/:id_grade" element={<GradeStudents />} />
           <Route path="teacher/students/view/:id_user" element={<StudentDetails />} />
        </Route>

          



        {/* ============ MÓDULOS EXTERNOS ============ */}
        {/* Recomiendo protegerlos también */}
        <Route
          path="/Module_1"
          element={
            <PrivateRoute>
              <div>Contenido módulo 1</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/Module_2"
          element={
            <PrivateRoute>
              <div>Contenido módulo 2</div>
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

        {/* ============ COMPAT: si alguien entra al viejo "/" privado ============ */}
        {/* Si antes usabas "/" como dashboard, puedes redirigirlo a /app */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* Página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
