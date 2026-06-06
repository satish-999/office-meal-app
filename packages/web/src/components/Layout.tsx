import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          <div className="meta">
            {user?.name} · {user?.role} · {user?.email}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Log out
        </button>
      </header>
      <Outlet />
    </div>
  );
}

export function DietBadge({ diet }: { diet: "veg" | "non_veg" }) {
  return (
    <span className={diet === "veg" ? "badge badge-veg" : "badge badge-nonveg"}>
      {diet === "veg" ? "Veg" : "Non-Veg"}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function tabClass({ isActive }: { isActive: boolean }) {
  return isActive ? "active" : "";
}

export function RoleNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="nav-tabs">
      {user.role === "employee" && (
        <>
          <NavLink to="/employee" className={tabClass} end>
            Register
          </NavLink>
          <NavLink to="/employee/menu" className={tabClass}>
            Menu
          </NavLink>
          <NavLink to="/employee/bookings" className={tabClass}>
            My bookings
          </NavLink>
          <NavLink to="/employee/feedback" className={tabClass}>
            Feedback
          </NavLink>
        </>
      )}
      {user.role === "server" && (
        <>
          <NavLink to="/server" className={tabClass} end>
            Scan QR
          </NavLink>
          <NavLink to="/server/manual" className={tabClass}>
            Manual serve
          </NavLink>
        </>
      )}
      {user.role === "admin" && (
        <>
          <NavLink to="/admin" className={tabClass} end>
            Daily report
          </NavLink>
          <NavLink to="/admin/bookings" className={tabClass}>
            All bookings
          </NavLink>
          <NavLink to="/admin/menu" className={tabClass}>
            Menu admin
          </NavLink>
          <NavLink to="/admin/feedback" className={tabClass}>
            Feedback
          </NavLink>
        </>
      )}
    </nav>
  );
}
