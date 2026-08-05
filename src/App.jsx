import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Guards: mejor dejarlos eager
import PublicRoute from "./features/auth/components/PublicRoute.jsx";
import PrivateRoute from "./features/auth/components/PrivateRoute.jsx";
import SidebarLayout from "./features/dashboard/layouts/SidebarLayout.jsx";
import LogOut from "./features/auth/pages/LogOut.jsx";
// Lazy imports: páginas y layouts pesados

const NotFound = lazy(() => import("./features/system/pages/NotFoud.jsx"));
const Introduction = lazy(
  () => import("./features/marketing/pages/Introduction.jsx"),
);
const Login = lazy(() => import("./features/auth/pages/Login.jsx"));
const LandingPage = lazy(
  () => import("./features/marketing/pages/LandingPage.jsx"),
);

const Inicio = lazy(
  () => import("./features/dashboard/pages/shared/Inicio.jsx"),
);
const Perfil = lazy(
  () => import("./features/dashboard/pages/shared/Perfil.jsx"),
);
const Ranking = lazy(
  () => import("./features/dashboard/pages/shared/Ranking.jsx"),
);
const Ajustes = lazy(
  () => import("./features/dashboard/pages/shared/Ajustes.jsx"),
);
const Store = lazy(() => import("./features/dashboard/pages/shared/Store.jsx"));
const HeatMap = lazy(
  () => import("./features/dashboard/pages/shared/heatMap.jsx"),
);

const Users = lazy(() => import("./features/dashboard/pages/admin/Users.jsx"));
const AddUsers = lazy(
  () => import("./features/dashboard/pages/admin/addUsers.jsx"),
);
const GestSystem = lazy(
  () => import("./features/dashboard/pages/admin/gestSystem.jsx"),
);

const Estadisticas = lazy(
  () => import("./features/dashboard/pages/teacher/statistics.jsx"),
);
const Graficos = lazy(
  () => import("./features/dashboard/pages/teacher/graphs.jsx"),
);
const TeacherGrades = lazy(
  () => import("./features/dashboard/pages/teacher/TeacherGrades.jsx"),
);
const GradeStudents = lazy(
  () => import("./features/dashboard/pages/teacher/GradeStudents.jsx"),
);
const StudentDetails = lazy(
  () => import("./features/dashboard/pages/teacher/StudentDetails.jsx"),
);

const ManageCollege = lazy(
  () => import("./features/dashboard/pages/admin/manage/manageCollege.jsx"),
);
const ManageGrade = lazy(
  () => import("./features/dashboard/pages/admin/manage/manageGrade.jsx"),
);
const ManageInsignia = lazy(
  () => import("./features/dashboard/pages/admin/manage/manageInsignia.jsx"),
);
const ManageRol = lazy(
  () => import("./features/dashboard/pages/admin/manage/manageRol.jsx"),
);

const ModuleMenuPage = lazy(
  () => import("./features/module/pages/ModuleMenuPage.jsx"),
);
const ModuleActivtyPage = lazy(
  () => import("./features/module/pages/ModuleActivtyPage.jsx"),
);
const GestModules = lazy(
  () => import("./features/dashboard/pages/teacher/GestModules.jsx"),
);

// -----------------------------
// UI helpers
// -----------------------------
function FullscreenLoader({ text = "Cargando..." }) {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm md:text-base text-white/80">{text}</p>
      </div>
    </div>
  );
}

function ContentLoader({ text = "Cargando vista..." }) {
  return (
    <div className="min-h-[40vh] w-full grid place-items-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/70">{text}</p>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error cargando ruta lazy:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] w-full grid place-items-center p-6">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl backdrop-blur">
            <h2 className="text-lg font-semibold">
              No se pudo cargar esta vista
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Puede ser un fallo temporal del chunk o de la red.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function withSuspense(element, fallback = <ContentLoader />) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={fallback}>{element}</Suspense>
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route
          path="/"
          element={
            <PublicRoute redirectTo="/app">
              {withSuspense(
                <LandingPage />,
                <FullscreenLoader text="Cargando inicio..." />,
              )}
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute redirectTo="/app">
              {withSuspense(
                <Login />,
                <FullscreenLoader text="Cargando login..." />,
              )}
            </PublicRoute>
          }
        />

        <Route
          path="/i"
          element={withSuspense(
            <Introduction />,
            <FullscreenLoader text="Cargando introducción..." />,
          )}
        />

        {/* Privadas */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              {withSuspense(
                <SidebarLayout />,
                <FullscreenLoader text="Cargando panel..." />,
              )}
            </PrivateRoute>
          }
        >
          <Route index element={withSuspense(<Inicio />)} />
          <Route path="perfil" element={withSuspense(<Perfil />)} />
          <Route path="ranking" element={withSuspense(<Ranking />)} />
          <Route path="ajustes" element={withSuspense(<Ajustes />)} />
          <Route path="logout" element={withSuspense(<LogOut />)} />
          <Route path="store" element={withSuspense(<Store />)} />
          {/* admin */}
          <Route path="users" element={withSuspense(<Users />)} />
          <Route path="add_user" element={withSuspense(<AddUsers />)} />
          <Route path="admin" element={withSuspense(<GestSystem />)} />
          {/* teacher */}
          <Route path="teacher/graphs" element={withSuspense(<Graficos />)} />
          <Route
            path="teacher/statistics"
            element={withSuspense(<Estadisticas />)}
          />
          <Route path="teacher/heatmap" element={withSuspense(<HeatMap />)} />
          <Route
            path="teacher/students"
            element={withSuspense(<TeacherGrades />)}
          />
          <Route
            path="teacher/students/:id_grade"
            element={withSuspense(<GradeStudents />)}
          />
          <Route
            path="teacher/students/view/:id_user"
            element={withSuspense(<StudentDetails />)}
          />{" "}
          <Route
            path="teacher/Gest-Modules"
            element={withSuspense(<GestModules />)}
          />
          {/* manage */}
          <Route
            path="manage/college"
            element={withSuspense(<ManageCollege />)}
          />
          <Route path="manage/grade" element={withSuspense(<ManageGrade />)} />
          <Route
            path="manage/insignia"
            element={withSuspense(<ManageInsignia />)}
          />
          <Route path="manage/rol" element={withSuspense(<ManageRol />)} />
        </Route>

        {/* Módulos legacy protegidos */}
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

        {/* Módulos reales: ahora protegidos + lazy */}
        <Route
          path="/modules/:moduleCode"
          element={
            <PrivateRoute>{withSuspense(<ModuleMenuPage />)}</PrivateRoute>
          }
        />
        <Route
          path="/modules/:moduleCode/:missionKey"
          element={
            <PrivateRoute>{withSuspense(<ModuleActivtyPage />)}</PrivateRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={withSuspense(
            <NotFound />,
            <FullscreenLoader text="Cargando..." />,
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
