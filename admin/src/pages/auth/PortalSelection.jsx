import { useNavigate } from "react-router-dom";
import { Landmark, Activity, Shield, Building2, Store, Users } from "lucide-react";

export default function PortalSelection() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Bank Portal",
      description: "Manage bank branches and operations",
      icon: Landmark,
      colorClass: "bg-sky-100 text-sky-700",
      path: "/bank-login",
    },
    {
      title: "Hospital Portal",
      description: "Manage hospital branches and staff",
      icon: Activity,
      colorClass: "bg-emerald-100 text-emerald-700",
      path: "/hospital-login",
    },
    {
      title: "Police Portal",
      description: "Manage police stations and officers",
      icon: Shield,
      colorClass: "bg-amber-100 text-amber-700",
      path: "/police-login",
    },
    {
      title: "Organization Admin",
      description: "Manage your specific organization network",
      icon: Building2,
      colorClass: "bg-indigo-100 text-indigo-700",
      path: "/admin-login",
    },
    {
      title: "Branch Admin",
      description: "Manage daily branch operations and local staff",
      icon: Store,
      colorClass: "bg-purple-100 text-purple-700",
      path: "/branch-login",
    },
    {
      title: "Staff & Doctors",
      description: "Access your daily tasks and token queues",
      icon: Users,
      colorClass: "bg-slate-100 text-slate-700",
      path: "/login",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Select Your Portal
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Choose your administrative dashboard to continue
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <button
                key={portal.title}
                onClick={() => navigate(portal.path)}
                className="group relative flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md outline-none focus:ring-4 focus:ring-slate-100"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${portal.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                  {portal.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-500">
                  {portal.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}