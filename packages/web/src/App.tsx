import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/employee/RegisterPage";
import { EmployeeMenuPage } from "./pages/employee/EmployeeMenuPage";
import { BookingsPage } from "./pages/employee/BookingsPage";
import { FeedbackPage } from "./pages/employee/FeedbackPage";
import { ScanPage } from "./pages/server/ScanPage";
import { ManualServePage } from "./pages/server/ManualServePage";
import { ReportPage } from "./pages/admin/ReportPage";
import { BookingsListPage } from "./pages/admin/BookingsListPage";
import { MenuAdminPage } from "./pages/admin/MenuAdminPage";
import { FeedbackAdminPage } from "./pages/admin/FeedbackAdminPage";
import { EmployeesAdminPage } from "./pages/admin/EmployeesAdminPage";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "employee") return <Navigate to="/employee" replace />;
  if (user.role === "server") return <Navigate to="/server" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            element={<ProtectedRoute role="employee" />}
          >
            <Route
              element={<Layout title="Employee — Office Meal" />}
            >
              <Route path="/employee" element={<RegisterPage />} />
              <Route path="/employee/menu" element={<EmployeeMenuPage />} />
              <Route path="/employee/bookings" element={<BookingsPage />} />
              <Route path="/employee/feedback" element={<FeedbackPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="server" />}>
            <Route element={<Layout title="Server — Office Meal" />}>
              <Route path="/server" element={<ScanPage />} />
              <Route path="/server/manual" element={<ManualServePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<Layout title="Admin — Office Meal" />}>
              <Route path="/admin" element={<ReportPage />} />
              <Route path="/admin/bookings" element={<BookingsListPage />} />
              <Route path="/admin/menu" element={<MenuAdminPage />} />
              <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
              <Route path="/admin/employees" element={<EmployeesAdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
