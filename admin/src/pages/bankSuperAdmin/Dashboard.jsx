import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationsByTenant,
  getBranchesByTenant,
  getAllOrganizationAdmins,
  getUsersByTenant,
} from "../../services/tenantService";
import { getPendingBranchRequests } from "../../services/branchRequestService";
import { Landmark, GitMerge, Clock, Users } from "lucide-react";
import { BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TENANTS = ["bank"];
const userRoleColors = ["#0ea5e9", "#6366f1", "#10b981"];

export default function BankSuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, tenantType } = useAuth();

  const [stats, setStats] = useState({
    companies: 0,
    orgAdmins: 0,
    branches: 0,
    pendingRequests: 0,
    staff: 0,
  });

  const [branchChartData, setBranchChartData] = useState([]);
  const [userRoleChartData, setUserRoleChartData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        if (isMounted) {
          setError("");
        }

        const [
          orgResults,
          branchResults,
          orgAdmins,
          userResults,
          pendingRequestsResult,
        ] = await Promise.all([
          Promise.all(TENANTS.map((t) => getOrganizationsByTenant(t).catch((error) => {
            console.error("getOrganizationsByTenant error:", error);
            return [];
          }))),
          Promise.all(TENANTS.map((t) => getBranchesByTenant(t).catch((error) => {
            console.error("getBranchesByTenant error:", error);
            return [];
          }))),
          getAllOrganizationAdmins().catch((error) => {
            console.error("getAllOrganizationAdmins error:", error);
            return [];
          }),
          Promise.all(TENANTS.map((t) => getUsersByTenant(t).catch((error) => {
            console.error("getUsersByTenant error:", error);
            return [];
          }))),
          getPendingBranchRequests().catch((error) => {
            console.error("getPendingBranchRequests error:", error);
            return { branchRequests: [] };
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const organizations = orgResults.flat();
        const branches = branchResults.flat();
        const users = userResults.flat();
        const pendingRequests = Array.isArray(pendingRequestsResult?.branchRequests)
          ? pendingRequestsResult.branchRequests
          : [];

        const staff = users.filter((u) => u.role !== "organization_admin");
        const roleCounts = users.reduce(
          (accumulator, currentUser) => {
            const role = String(currentUser?.role || "").toLowerCase();

            if (role === "organization_admin") {
              accumulator.organization_admin += 1;
            } else if (role === "branch_admin") {
              accumulator.branch_admin += 1;
            } else if (role === "staff") {
              accumulator.staff += 1;
            }

            return accumulator;
          },
          {
            organization_admin: 0,
            branch_admin: 0,
            staff: 0,
          }
        );

        setStats({
          companies: organizations.length,
          orgAdmins: orgAdmins.length,
          branches: branches.length,
          pendingRequests: pendingRequests.length,
          staff: staff.length,
        });

        // 📊 Chart: branches per organization
        const branchMap = {};

        branches.forEach((b) => {
          const orgName =
            b.organizationName ||
            b.organization?.organizationName ||
            b.organization?.name ||
            "Unknown";

          branchMap[orgName] = (branchMap[orgName] || 0) + 1;
        });

        const chartData = Object.keys(branchMap).map((key) => ({
          name: key,
          branches: branchMap[key],
        }));

        setBranchChartData(chartData);

        setUserRoleChartData(
          [
            { name: "Organization Admin", value: roleCounts.organization_admin },
            { name: "Branch Admin", value: roleCounts.branch_admin },
            { name: "Staff", value: roleCounts.staff },
          ].filter((item) => item.value > 0)
        );

        // 🕒 Recent onboarding (latest 5 branches)
        const activities = [...branches]
          .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
          .slice(0, 5)
          .map((branch) => ({
            branchName: branch?.branchName || "-",
            organization:
              branch?.organizationName ||
              branch?.organization?.organizationName ||
              branch?.organization?.name ||
              "-",
            status: branch?.status || "inactive",
            createdAt: branch?.createdAt ? new Date(branch.createdAt).toLocaleDateString() : "-",
          }));

        setRecentActivities(activities);

        if (!isMounted) {
          return;
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err?.message || "Failed to load dashboard data");
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchData(true);

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const summaryCards = [
    {
      title: "Total Banks",
      value: stats.companies,
      icon: Landmark,
      iconClass: "bg-sky-100 text-sky-700",
    },
    {
      title: "Total Branches",
      value: stats.branches,
      icon: GitMerge,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Total Staff",
      value: stats.staff,
      icon: Users,
      iconClass: "bg-indigo-100 text-indigo-700",
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
          Loading dashboard...
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
        <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Branches per Organization</h2>
            <p className="mt-1 text-sm text-slate-500">Branch distribution across organizations.</p>
            <div className="mt-5 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChartData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="branches" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">User Role Distribution</h2>
            <p className="mt-1 text-sm text-slate-500">Breakdown of organization, branch, and staff users.</p>
            <div className="mt-5 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={userRoleChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {userRoleChartData.map((entry, index) => (
                      <Cell key={`user-role-${entry.name}`} fill={userRoleColors[index % userRoleColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">Common bank administration tasks.</p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/bank-super-admin/add-bank")}
                className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                + Add Bank Organization
              </button>
              <button
                type="button"
                onClick={() => navigate("/bank-super-admin/branch-requests")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Review Pending Branches
              </button>
              <button
                type="button"
                onClick={() => navigate("/bank-super-admin/organizations")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View All Organizations
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recently Onboarded Branches</h2>
                <p className="mt-1 text-sm text-slate-500">Latest 5 branches added to the bank network.</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Branch Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Organization</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentActivities.map((branch) => (
                    <tr key={`${branch.branchName}-${branch.createdAt}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{branch.branchName}</td>
                      <td className="px-4 py-3 text-slate-600">{branch.organization}</td>
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

        {/* User Info */}
        {user && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            Logged in as {user.email} ({tenantType})
          </div>
        )}
      </div>
    </div>
  );
}
