import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// 1. getRoleLabel එක import කරගන්නවා
import { getSidebarLinksByRole, getRoleLabel } from "../utils/permissions";

export default function AdminLayout() {
  // 2. useAuth එකෙන් tenantType එකත් එළියට ගන්නවා
  const { user, role, tenantType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = getSidebarLinksByRole(role, tenantType);
  
  // 3. tenantType එකත් යවලා අදාල ලස්සන නම (Display Role) හදාගන්නවා
  const displayRole = getRoleLabel(role, tenantType);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-300">MAIN</p>
            <h1 className="mt-1 text-lg font-bold">Admin Panel</h1>
          </div>

          <nav className="mt-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-sky-100 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Signed In As</p>
                <p className="text-sm font-semibold text-slate-900">{user?.email || "Unknown"}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* 4. අලුතින් හදාගත්තු displayRole එක මෙතනට දෙනවා */}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {displayRole || "guest"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 lg:px-8">
            <div className="mb-4 text-xs text-slate-500">{location.pathname}</div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}