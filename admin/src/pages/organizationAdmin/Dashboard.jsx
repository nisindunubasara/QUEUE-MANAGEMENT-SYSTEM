import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Building2, Clock, Layers, Users } from "lucide-react";
import { getBranches } from "../../services/branchService";
import { getOrganizationAdminCounts } from "../../services/organizationAdminService";
import { getOrganizationBranchServices } from "../../services/organizationAdminService";
import { getMyBranchRequests } from "../../services/branchRequestService";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const branchStatusData = [
  { name: "Active", value: 12 },
  { name: "Pending", value: 3 },
  { name: "Inactive", value: 1 },
];

const branchStatusColors = ["#10b981", "#f59e0b", "#94a3b8"];

export default function SharedOrganizationAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    branches: 0,
    services: 0,
    branchAdmins: 0,
    staff: 0,
  });
  const [branchesList, setBranchesList] = useState([]);
  const [branchServicesList, setBranchServicesList] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        if (isMounted) {
          setError("");
        }

        const [countsResult, branchRequestsResult, branchesResponse, branchServicesResponse] = await Promise.all([
          getOrganizationAdminCounts(user),
          getMyBranchRequests(),
          getBranches().catch((branchError) => {
            console.error("Error fetching branches list:", branchError);
            return { branches: [] };
          }),
          getOrganizationBranchServices().catch((serviceError) => {
            console.error("Error fetching organization branch services:", serviceError);
            return [];
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setCounts({
          branches: Number(countsResult?.branches || 0),
          services: Number(countsResult?.services || 0),
          branchAdmins: Number(countsResult?.branchAdmins || 0),
          staff: Number(countsResult?.staff || 0),
        });

        setPendingRequestsCount(
          Array.isArray(branchRequestsResult?.branchRequests)
            ? branchRequestsResult.branchRequests.length
            : 0
        );

        setBranchesList(Array.isArray(branchesResponse?.branches) ? branchesResponse.branches : []);
        setBranchServicesList(Array.isArray(branchServicesResponse) ? branchServicesResponse : []);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(fetchError?.message || "Failed to load organization dashboard data");
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    loadDashboardData(true);

    const intervalId = setInterval(() => {
      loadDashboardData(false);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  const workforce = Number(counts.staff || 0) + Number(counts.branchAdmins || 0);

  const dynamicBranchStatusData = ["active", "pending", "inactive"]
    .map((status) => {
      const value = branchesList.reduce((sum, branch) => {
        return String(branch?.status || "").toLowerCase() === status ? sum + 1 : sum;
      }, 0);

      return {
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
      };
    })
    .filter((item) => item.value > 0);

  const dynamicRecentBranches = [...branchesList]
    .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
    .slice(0, 5)
    .map((branch) => ({
      branchName: branch?.branchName || "-",
      code: branch?.branchCode || "-",
      status: branch?.status || "inactive",
      createdAt: branch?.createdAt ? new Date(branch.createdAt).toLocaleDateString() : "-",
    }));

  const dynamicTopBranchesData = [...branchServicesList]
    .map((item) => ({
      branch: item?.branchName || "-",
      servicesCount: Array.isArray(item?.services) ? item.services.length : 0,
    }))
    .sort((left, right) => right.servicesCount - left.servicesCount)
    .slice(0, 5);

  const cards = [
    {
      title: "Branches",
      value: counts.branches,
      icon: Building2,
      iconClass: "bg-sky-100 text-sky-700",
    },
    {
      title: "Pending Requests",
      value: pendingRequestsCount,
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Services",
      value: counts.services,
      icon: Layers,
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Workforce",
      value: workforce,
      icon: Users,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
  ];

  const getStatusBadgeClass = (status = "") => {
    const normalized = String(status).toLowerCase();

    if (normalized === "active") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (normalized === "pending") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-200 text-slate-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading organization dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Organization Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back, {user?.name || user?.username || user?.email || "Organization Admin"}.
          </p>
          <p className="mt-1 text-xs text-slate-500">Signed in as {user?.email || "-"}</p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Branch Status Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Breakdown of branch lifecycle status across the organization.
            </p>
            <div className="mt-5 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={dynamicBranchStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {dynamicBranchStatusData.map((entry, index) => (
                      <Cell key={`branch-status-${entry.name}`} fill={branchStatusColors[index % branchStatusColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Top Branches by Staff Size</h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare service volume for the busiest branches.
            </p>
            <div className="mt-5 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicTopBranchesData}>
                  <XAxis dataKey="branch" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="servicesCount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">Create and manage core organization records.</p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/organization-admin/add-branch")}
                className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                + Add New Branch
              </button>
              <button
                type="button"
                onClick={() => navigate("/organization-admin/branch-admins")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + Add Branch Admin
              </button>
              <button
                type="button"
                onClick={() => navigate("/organization-admin/add-service")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + Add Service
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent Branch Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest branch creation updates across the organization.</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Branch Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dynamicRecentBranches.map((branch) => (
                    <tr key={branch.code} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{branch.branchName}</td>
                      <td className="px-4 py-3 text-slate-600">{branch.code}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(branch.status)}`}>
                          {branch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{branch.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}