import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TENANT_TEXT } from "../../utils/tenantTextConfig";
import { Clock3, Gauge, Ticket, Users } from "lucide-react";
import {
  getBranchAdminCounts,
  getBranchAdminOperationsDashboard,
} from "../../services/branchAdminService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const peakHoursData = [
  { hour: "8 AM", tokens: 18 },
  { hour: "9 AM", tokens: 29 },
  { hour: "10 AM", tokens: 42 },
  { hour: "11 AM", tokens: 38 },
  { hour: "12 PM", tokens: 31 },
  { hour: "1 PM", tokens: 24 },
  { hour: "2 PM", tokens: 35 },
  { hour: "3 PM", tokens: 44 },
  { hour: "4 PM", tokens: 36 },
  { hour: "5 PM", tokens: 27 },
];

export default function BranchAdminDashboard() {
  const { user, tenantType, organizationId, divisionId, branchId } = useAuth();
  const [countsData, setCountsData] = useState({
    staff: 0,
    operations: 0,
    tokens: 0,
    tasks: 0,
  });
  const [operationsDashboardData, setOperationsDashboardData] = useState(null);
  const [serviceLimitProgressData, setServiceLimitProgressData] = useState([]);
  const [activeCounters, setActiveCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const textConfig =
    TENANT_TEXT[tenantType]?.branchAdminPages?.dashboard || TENANT_TEXT.bank.branchAdminPages.dashboard;

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

        const [countsResult, operationsResult] = await Promise.all([
          getBranchAdminCounts({ tenantType, organizationId, divisionId, branchId }),
          getBranchAdminOperationsDashboard(),
        ]);

        if (!isMounted) {
          return;
        }

        const normalizedCounts = countsResult || {};
        const services = Array.isArray(operationsResult?.services) ? operationsResult.services : [];
        const todayKey = new Date().toISOString().split("T")[0];
        setCountsData({
          staff: Number(normalizedCounts.staff || 0),
          operations: Number(normalizedCounts.operations || 0),
          tokens: Number(normalizedCounts.tokens || 0),
          tasks: Number(normalizedCounts.tasks || 0),
        });
        setOperationsDashboardData(operationsResult || null);

        setServiceLimitProgressData(
          services.map((service) => ({
            service: service?.serviceName || "Unnamed Service",
            issued: 0,
            limit: Number(
              (Array.isArray(service?.dailyLimits)
                ? service.dailyLimits.find(
                    (entry) => String(entry?.date || "") === todayKey
                  )?.limit
                : undefined) ?? service?.maxDailyTokens ?? 0
            ),
          }))
        );

        const nextActiveCounters = services
          .flatMap((service) => {
            const counters = Array.isArray(service?.counters) ? service.counters : [];

            return counters
              .filter((counter) => String(counter?.status || "").toLowerCase() === "active")
              .map((counter) => ({
                counterName: counter?.counterName || "Counter",
                assignedStaff: counter?.assignedStaff?.name || "Unassigned",
                currentServingToken: "Waiting",
                serviceName: service?.serviceName || "Unnamed Service",
              }));
          });

        setActiveCounters(nextActiveCounters);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError?.message || "Failed to load dashboard data");
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
  }, [tenantType, organizationId, divisionId, branchId]);

  const totalTokensIssuedToday = Number(countsData.tokens || 0);
  const waitingInQueue = Number(countsData.tasks || countsData.operations || 0);
  const activeStaffMembers = Array.isArray(operationsDashboardData?.staffSummary?.activeStaff)
    ? operationsDashboardData.staffSummary.activeStaff.length
    : 0;
  const branchMaxDailyTokens = Number(operationsDashboardData?.branch?.maxDailyTokens || 0);
  const tokenCapacityPercent =
    branchMaxDailyTokens > 0
      ? Math.min(100, Math.round((totalTokensIssuedToday / branchMaxDailyTokens) * 100))
      : 0;

  const cards = [
    {
      title: textConfig.cards.totalTokens,
      value: totalTokensIssuedToday,
      icon: Ticket,
      iconClass: "bg-sky-100 text-sky-700",
    },
    {
      title: textConfig.cards.waiting,
      value: waitingInQueue,
      icon: Clock3,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      title: textConfig.cards.capacity,
      value: `${tokenCapacityPercent}%`,
      icon: Gauge,
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      title: textConfig.cards.staff,
      value: activeStaffMembers,
      icon: Users,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{textConfig.roleLabel}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{textConfig.pageTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back, {user?.name || user?.username || user?.email || textConfig.roleLabel}.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Signed in as {user?.email || "-"} | Tenant: {tenantType || "-"}
          </p>
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
            <h2 className="text-lg font-semibold text-slate-900">{textConfig.charts.peakTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{textConfig.charts.peakSubtitle}</p>
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{textConfig.charts.limitTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{textConfig.charts.limitSubtitle}</p>
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceLimitProgressData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="service" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="issued" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="limit" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{textConfig.monitor.title}</h2>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {textConfig.monitor.subtitle}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {activeCounters.map((counter) => (
              <article
                key={`${counter.counterName}-${counter.serviceName}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    {counter.counterName}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>

                <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-indigo-500">
                    {textConfig.monitor.serving}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{counter.currentServingToken}</p>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">{textConfig.monitor.staffLabel}</span>
                    <span className="font-medium text-slate-800">{counter.assignedStaff}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">{textConfig.monitor.serviceLabel}</span>
                    <span className="font-medium text-slate-800">{counter.serviceName}</span>
                  </div>
                </div>
              </article>
            ))}
            {activeCounters.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  {textConfig.monitor.emptyState}
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
