import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createBranchCounter,
  getBranchAdminOperationsDashboard,
  updateServiceDailyLimits,
  updateBranchServiceLimit,
  updateBranchServiceAverageTime,
  updateBranchServiceStatus,
} from "../../services/branchAdminService";

const formatStatusLabel = (status = "") => {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getStatusBadgeClass = (status = "") => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized === "inactive") {
    return "bg-slate-200 text-slate-700";
  }

  if (normalized === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
};

const getUpcomingDates = () => {
  const dates = [];
  const today = new Date();

  for (let index = 0; index < 7; index += 1) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + index);
    dates.push(nextDate.toISOString().split("T")[0]);
  }

  return dates;
};

const upcomingDates = getUpcomingDates();

const buildDailyLimitValues = (dailyLimits = []) => {
  const values = {};

  upcomingDates.forEach((date) => {
    values[date] = 0;
  });

  if (Array.isArray(dailyLimits)) {
    dailyLimits.forEach((entry) => {
      const date = String(entry?.date || "").trim();
      if (!date || !Object.prototype.hasOwnProperty.call(values, date)) {
        return;
      }

      values[date] = Number(entry?.limit) || 0;
    });
  }

  return values;
};

const StaffListBlock = ({ title, staff = [] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

    {staff.length === 0 ? (
      <p className="mt-3 text-sm text-slate-500">No staff or doctors</p>
    ) : (
      <div className="mt-3 space-y-2">
        {staff.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-slate-900">{member.name || "-"}</p>
              {member.role && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {member.role}
                </span>
              )}
            </div>
            <p className="text-slate-600">{member.email || "-"}</p>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default function BranchAdminOperations() {
  const { tenantType, organizationId, branchId: authBranchId } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLimitDate, setSelectedLimitDate] = useState(new Date().toISOString().split("T")[0]);
  const [openCounterFormServiceId, setOpenCounterFormServiceId] = useState("");
  const [counterForms, setCounterForms] = useState({});
  const [limitForms, setLimitForms] = useState({});
  const [dailyLimitForms, setDailyLimitForms] = useState({});
  
  const [averageTimeForms, setAverageTimeForms] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBranchAdminOperationsDashboard();
        if (!isMounted) {
          return;
        }

        setDashboard(data || null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err?.message || "Failed to load branch operations");
        setDashboard(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setDailyLimitForms((current) => {
      const servicesList = Array.isArray(dashboard?.services) ? dashboard.services : [];
      if (servicesList.length === 0) {
        return current;
      }

      const nextState = { ...current };

      servicesList.forEach((service) => {
        const serviceId = String(service?.serviceId || "");
        if (!serviceId || nextState[serviceId]) {
          return;
        }

        nextState[serviceId] = {
          values: buildDailyLimitValues(service?.dailyLimits),
          loading: false,
          error: "",
          success: "",
        };
      });

      return nextState;
    });

    

    setAverageTimeForms((current) => {
      const servicesList = Array.isArray(dashboard?.services) ? dashboard.services : [];
      if (servicesList.length === 0) {
        return current;
      }

      const nextState = {};

      servicesList.forEach((service) => {
        const serviceId = String(service?.serviceId || "");
        if (!serviceId) {
          return;
        }

        nextState[serviceId] = Number(service?.averageTokenTime || 15) || 15;
      });

      return nextState;
    });
  }, [dashboard]);

  

  const handleAverageTimeChange = (serviceId, value) => {
    setAverageTimeForms((current) => ({
      ...current,
      [serviceId]: value,
    }));
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      const response = await updateBranchServiceStatus(serviceId, newStatus);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update service status");
      }

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        const nextServices = Array.isArray(current.services)
          ? current.services.map((service) => {
              if (String(service.serviceId) !== String(serviceId)) {
                return service;
              }

              return {
                ...service,
                status: newStatus,
              };
            })
          : [];

        return {
          ...current,
          services: nextServices,
        };
      });
    } catch (error) {
      const message = error?.message || "Failed to update service status";
      setError(message);
      alert(message);
    }
  };

  

  const branchName = dashboard?.branch?.branchName || "-";
  const branchMaxTokens = dashboard?.branch?.maxDailyTokens || 0;
  const services = Array.isArray(dashboard?.services) ? dashboard.services : [];
  const totalAllocatedTokens = services.reduce(
    (sum, service) => sum + (Number(service.maxDailyTokens) || 0),
    0
  );
  const remainingTokens = branchMaxTokens > 0 ? branchMaxTokens - totalAllocatedTokens : "Unlimited";
  const allocatedTokensForSelectedDate = services.reduce((sum, service) => {
    const serviceDailyLimits = Array.isArray(service?.dailyLimits) ? service.dailyLimits : [];
    const selectedDateLimit = serviceDailyLimits.find(
      (entry) => String(entry?.date || "") === selectedLimitDate
    );

    return sum + (Number(selectedDateLimit?.limit) || 0);
  }, 0);
  const remainingTokensForSelectedDate =
    branchMaxTokens > 0 ? branchMaxTokens - allocatedTokensForSelectedDate : "Unlimited";
  const activeStaff = Array.isArray(dashboard?.staffSummary?.activeStaff)
    ? dashboard.staffSummary.activeStaff
    : [];
  const inactiveStaff = Array.isArray(dashboard?.staffSummary?.inactiveStaff)
    ? dashboard.staffSummary.inactiveStaff
    : [];
  const unassignedStaff = Array.isArray(dashboard?.staffSummary?.unassignedStaff)
    ? dashboard.staffSummary.unassignedStaff
    : [];
  const unassignedCounters = Array.isArray(dashboard?.unassignedCounters)
  ? dashboard.unassignedCounters
  : [];

  const toggleCounterForm = (serviceId) => {
    setError("");
    setOpenCounterFormServiceId((current) => (current === serviceId ? "" : serviceId));
  };

  const handleCounterFormChange = (serviceId, value) => {
    setCounterForms((current) => ({
      ...current,
      [serviceId]: {
        ...current[serviceId],
        counterName: value,
      },
    }));
  };

  const handleLimitFormChange = (serviceId, valueOrDate, maybeValue) => {
    if (typeof maybeValue !== "undefined") {
      const date = valueOrDate;
      const value = maybeValue;

      setLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          dateValues: {
            ...(current[serviceId]?.dateValues || {}),
            [date]: value,
          },
          dailyError: "",
          dailySuccess: "",
        },
      }));

      return;
    }

    const value = valueOrDate;
    setLimitForms((current) => ({
      ...current,
      [serviceId]: {
        ...current[serviceId],
        value,
        error: "",
        success: "",
      },
    }));
  };

  const handleDailyLimitChange = (serviceId, date, value, fallbackDailyLimits = []) => {
    setDailyLimitForms((current) => {
      const currentForm = current[serviceId] || {
        values: buildDailyLimitValues(fallbackDailyLimits),
        loading: false,
        error: "",
        success: "",
      };

      return {
        ...current,
        [serviceId]: {
          ...currentForm,
          values: {
            ...currentForm.values,
            [date]: value,
          },
          error: "",
          success: "",
        },
      };
    });
  };

  const handleSaveDailyLimits = async (service) => {
    const serviceId = String(service?.serviceId || "");
    if (!serviceId) {
      return;
    }

    const existingForm = dailyLimitForms[serviceId] || {
      values: buildDailyLimitValues(service?.dailyLimits),
      loading: false,
      error: "",
      success: "",
    };

    const payload = upcomingDates.map((date) => ({
      date,
      limit: Number(existingForm.values?.[date] ?? 0) || 0,
    }));

    try {
      setDailyLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...(current[serviceId] || existingForm),
          loading: true,
          error: "",
          success: "",
        },
      }));

      const response = await updateServiceDailyLimits(serviceId, payload);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update daily limits");
      }

      const averageTokenTime = Number(averageTimeForms[serviceId] ?? 15) || 15;
      const averageTimeResponse = await updateBranchServiceAverageTime(serviceId, averageTokenTime);
      if (!averageTimeResponse?.success) {
        throw new Error(averageTimeResponse?.message || "Failed to update average token time");
      }

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        const nextServices = Array.isArray(current.services)
          ? current.services.map((item) => {
              if (String(item.serviceId) !== serviceId) {
                return item;
              }

              return {
                ...item,
                dailyLimits: payload,
              };
            })
          : [];

        return {
          ...current,
          services: nextServices,
        };
      });

      setDailyLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...(current[serviceId] || existingForm),
          values: payload.reduce((accumulator, item) => {
            accumulator[item.date] = item.limit;
            return accumulator;
          }, {}),
          loading: false,
          error: "",
          success: "Daily limits updated successfully",
        },
      }));
    } catch (err) {
      setDailyLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...(current[serviceId] || existingForm),
          loading: false,
          error: err?.message || "Failed to update daily limits",
          success: "",
        },
      }));
    }
  };

  const handleUpdateLimit = async (serviceId, mode = "general") => {
    if (mode === "daily") {
      const formState = limitForms[serviceId] || {};
      const fallbackValue = dailyLimitForms[serviceId]?.values?.[selectedLimitDate] ?? 0;
      const selectedValue = Number(formState.dateValues?.[selectedLimitDate] ?? fallbackValue) || 0;

      const totalAllocatedForOtherServices = services
        .filter((service) => String(service.serviceId || "") !== String(serviceId))
        .reduce((sum, service) => {
          const otherServiceId = String(service.serviceId || "");
          const pendingValue = limitForms[otherServiceId]?.dateValues?.[selectedLimitDate];

          if (typeof pendingValue !== "undefined") {
            return sum + (Number(pendingValue) || 0);
          }

          const serviceDailyLimits = Array.isArray(service?.dailyLimits) ? service.dailyLimits : [];
          const selectedDateLimit = serviceDailyLimits.find(
            (entry) => String(entry?.date || "") === selectedLimitDate
          );

          return sum + (Number(selectedDateLimit?.limit) || 0);
        }, 0);

      const newTotalForSelectedDate = totalAllocatedForOtherServices + selectedValue;
      if (branchMaxTokens > 0 && newTotalForSelectedDate > branchMaxTokens) {
        setLimitForms((current) => ({
          ...current,
          [serviceId]: {
            ...current[serviceId],
            dateValues: {
              ...(current[serviceId]?.dateValues || {}),
              [selectedLimitDate]: selectedValue,
            },
            dailyLoading: false,
            dailyError: "Cannot allocate tokens. Exceeds the branch total daily limit.",
            dailySuccess: "",
          },
        }));

        return;
      }

      try {
        setLimitForms((current) => ({
          ...current,
          [serviceId]: {
            ...current[serviceId],
            dateValues: {
              ...(current[serviceId]?.dateValues || {}),
              [selectedLimitDate]: selectedValue,
            },
            dailyLoading: true,
            dailyError: "",
            dailySuccess: "",
          },
        }));

        const response = await updateServiceDailyLimits(serviceId, [
          {
            date: selectedLimitDate,
            limit: selectedValue,
          },
        ]);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to update daily limits");
        }

        const averageTokenTime = Number(averageTimeForms[serviceId] ?? 15) || 15;
        const averageTimeResponse = await updateBranchServiceAverageTime(serviceId, averageTokenTime);
        if (!averageTimeResponse?.success) {
          throw new Error(averageTimeResponse?.message || "Failed to update average token time");
        }

        setDashboard((current) => {
          if (!current) {
            return current;
          }

          const nextServices = Array.isArray(current.services)
            ? current.services.map((service) => {
                if (String(service.serviceId) !== String(serviceId)) {
                  return service;
                }

                const existingDailyLimits = Array.isArray(service.dailyLimits) ? service.dailyLimits : [];
                const withoutSelectedDate = existingDailyLimits.filter(
                  (item) => String(item?.date || "") !== selectedLimitDate
                );

                return {
                  ...service,
                  dailyLimits: [
                    ...withoutSelectedDate,
                    {
                      date: selectedLimitDate,
                      limit: selectedValue,
                    },
                  ],
                  averageTokenTime: averageTokenTime,
                };
              })
            : [];

          return {
            ...current,
            services: nextServices,
          };
        });

        setDailyLimitForms((current) => ({
          ...current,
          [serviceId]: {
            ...(current[serviceId] || {
              values: buildDailyLimitValues(),
              loading: false,
              error: "",
              success: "",
            }),
            values: {
              ...((current[serviceId] && current[serviceId].values) || {}),
              [selectedLimitDate]: selectedValue,
            },
            loading: false,
            error: "",
            success: "",
          },
        }));

        setLimitForms((current) => ({
          ...current,
          [serviceId]: {
            ...current[serviceId],
            dailyLoading: false,
            dailyError: "",
            dailySuccess: "Daily limit updated successfully",
          },
        }));
      } catch (err) {
        setLimitForms((current) => ({
          ...current,
          [serviceId]: {
            ...current[serviceId],
            dailyLoading: false,
            dailyError: err?.message || "Failed to update daily limits",
            dailySuccess: "",
          },
        }));
      }

      return;
    }

    const formState = limitForms[serviceId] || {};
    const maxDailyTokens = Number(formState.value ?? 0) || 0;

    try {
      setLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          value: maxDailyTokens,
          loading: true,
          error: "",
          success: "",
        },
      }));

      const response = await updateBranchServiceLimit(serviceId, maxDailyTokens);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update token limit");
      }

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        const nextServices = Array.isArray(current.services)
          ? current.services.map((service) => {
              if (String(service.serviceId) !== String(serviceId)) {
                return service;
              }

              return {
                ...service,
                maxDailyTokens,
              };
            })
          : [];

        return {
          ...current,
          services: nextServices,
        };
      });

      setLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          value: maxDailyTokens,
          loading: false,
          error: "",
          success: "Token limit updated successfully",
        },
      }));
    } catch (err) {
      setLimitForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          loading: false,
          error: err?.message || "Failed to update token limit",
          success: "",
        },
      }));
    }
  };

  const handleCreateCounter = async (service) => {
    const serviceId = String(service.serviceId || "");
    const formState = counterForms[serviceId] || {};
    const counterName = String(formState.counterName || "").trim();

    if (!counterName) {
      setCounterForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          error: "Counter name is required",
          success: "",
        },
      }));
      return;
    }

    try {
      setCounterForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          loading: true,
          error: "",
          success: "",
        },
      }));

      const response = await createBranchCounter({
        tenantType,
        organizationId,
        branchId: authBranchId || dashboard.branch.branchId,
        counterName,
        serviceId,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create counter");
      }

      const createdCounter = response.counter;

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        const nextServices = Array.isArray(current.services)
          ? current.services.map((item) => {
              if (String(item.serviceId) !== serviceId) {
                return item;
              }

              const nextCounters = Array.isArray(item.counters) ? item.counters : [];

              return {
                ...item,
                counters: [
                  ...nextCounters,
                  {
                    counterId: createdCounter?.id,
                    counterName: createdCounter?.counterName || counterName,
                    status: createdCounter?.status || "inactive",
                    assignedStaff: null,
                  },
                ],
                inactiveCounterCount: Number(item.inactiveCounterCount || 0) + 1,
              };
            })
          : [];

        return {
          ...current,
          services: nextServices,
        };
      });

      setCounterForms((current) => ({
        ...current,
        [serviceId]: {
          counterName: "",
          loading: false,
          error: "",
          success: "Counter created successfully",
        },
      }));
      setOpenCounterFormServiceId("");
    } catch (err) {
      setCounterForms((current) => ({
        ...current,
        [serviceId]: {
          ...current[serviceId],
          loading: false,
          error: err?.message || "Failed to create counter",
          success: "",
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Branch Operations</h1>
        <p className="mt-2 text-sm text-slate-500">Operations dashboard for {branchName}</p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading operations dashboard...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Services</h2>

          {services.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No services found for this branch</p>
          ) : (
            <div className="mt-4 space-y-4">
              {services.map((service) => {
                const counters = Array.isArray(service.counters) ? service.counters : [];
                const serviceId = String(service.serviceId || "");
                const formState = counterForms[serviceId] || {};
                const isFormOpen = openCounterFormServiceId === serviceId;
                const isCreating = Boolean(formState.loading);

                return (
                  <article
                    key={service.serviceId}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {service.serviceName || "Unnamed Service"}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                          <span className="rounded-full bg-slate-200 px-2.5 py-1">Active Counters: {service.activeCounterCount || 0}</span>
                          <span className="rounded-full bg-slate-200 px-2.5 py-1">Inactive Counters: {service.inactiveCounterCount || 0}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          service.status
                        )}`}
                      >
                        <select
                          value={String(service.status || "inactive").toLowerCase()}
                          onChange={(event) => handleStatusChange(service.id || service.serviceId || service._id, event.target.value)}
                          className={`cursor-pointer rounded-full border-0 bg-transparent px-2 py-0.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-offset-2 ${
                            String(service.status || "").toLowerCase() === "active"
                              ? "text-emerald-700 focus:ring-emerald-200"
                              : "text-slate-700 focus:ring-slate-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCounterForm(serviceId)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {isFormOpen ? "Hide Counter Form" : "+ Add Counter"}
                      </button>

                      {formState.success && !isFormOpen && (
                        <p className="text-sm font-medium text-emerald-700">{formState.success}</p>
                      )}
                    </div>

                    {isFormOpen && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                          <div>
                            <label
                              htmlFor={`counter-name-${serviceId}`}
                              className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                              Counter Name
                            </label>
                            <input
                              id={`counter-name-${serviceId}`}
                              type="text"
                              value={formState.counterName || ""}
                              onChange={(event) => handleCounterFormChange(serviceId, event.target.value)}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                              placeholder="e.g., Counter A"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCreateCounter(service)}
                            disabled={isCreating}
                            className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                          >
                            {isCreating ? "Creating..." : "Create"}
                          </button>
                        </div>

                        {formState.error && (
                          <p className="mt-3 text-sm text-red-700">{formState.error}</p>
                        )}

                        {formState.success && (
                          <p className="mt-3 text-sm text-emerald-700">{formState.success}</p>
                        )}
                      </div>
                    )}

                    {counters.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">No counters yet</p>
                    ) : (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="px-3 py-2 text-left font-semibold text-slate-900">Counter</th>
                              <th className="px-3 py-2 text-left font-semibold text-slate-900">Status</th>
                              <th className="px-3 py-2 text-left font-semibold text-slate-900">Assigned Staff</th>
                            </tr>
                          </thead>
                          <tbody>
                            {counters.map((counter) => (
                              <tr key={counter.counterId} className="border-b border-slate-100">
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {counter.counterName || "-"}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                      counter.status
                                    )}`}
                                  >
                                    {formatStatusLabel(counter.status)}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {counter.assignedStaff?.name || "No staff assigned"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Daily Limits Management</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {upcomingDates.map((date) => {
              const isSelected = date === selectedLimitDate;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedLimitDate(date)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {date}
                </button>
              );
            })}
          </div>

          

          <section className="my-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-sky-100 bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Branch Limit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{branchMaxTokens > 0 ? branchMaxTokens : "Unlimited"}</p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Allocated Tokens</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{allocatedTokensForSelectedDate}</p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remaining Tokens</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{remainingTokensForSelectedDate}</p>
              </div>
            </div>
          </section>

          {services.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No services found for daily limit management</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-3 py-2 font-semibold text-slate-900">Service Name</th>
                    <th className="px-3 py-2 font-semibold text-slate-900">Limit ({selectedLimitDate})</th>
                    <th className="px-3 py-2 font-semibold text-slate-900">Allocated Tokens</th>
                    <th className="px-3 py-2 font-semibold text-slate-900">Remaining Tokens</th>
                    <th className="px-3 py-2 font-semibold text-slate-900">Est. Time/Token (min)</th>
                    <th className="px-3 py-2 font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => {
                    const serviceId = String(service.serviceId || "");
                    const dailyLimitForm = dailyLimitForms[serviceId] || {
                      values: buildDailyLimitValues(service?.dailyLimits),
                      loading: false,
                      error: "",
                      success: "",
                    };
                    const selectedLimit = Number(dailyLimitForm.values?.[selectedLimitDate] ?? 0) || 0;
                    const allocatedTokens = 0;
                    const remainingForDate = Math.max(selectedLimit - allocatedTokens, 0);
                    const averageTokenTime = Number(averageTimeForms[serviceId] ?? service?.averageTokenTime ?? 15) || 15;

                    return (
                      <tr key={`daily-limit-${serviceId}`} className="border-b border-slate-100 align-top">
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {service.serviceName || "Unnamed Service"}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            value={
                              limitForms[serviceId]?.dateValues?.[selectedLimitDate] ??
                              dailyLimitForm.values?.[selectedLimitDate] ??
                              0
                            }
                            onChange={(event) =>
                              handleLimitFormChange(
                                serviceId,
                                selectedLimitDate,
                                event.target.value
                              )
                            }
                            className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100"
                            aria-label={`Daily token limit for ${service.serviceName || "service"} on ${selectedLimitDate}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-slate-600">{allocatedTokens}</td>
                        <td className="px-3 py-3 text-slate-600">{remainingForDate}</td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="1"
                            value={averageTokenTime}
                            onChange={(event) => handleAverageTimeChange(serviceId, event.target.value)}
                            className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100"
                            aria-label={`Estimated time per token for ${service.serviceName || "service"}`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => handleUpdateLimit(serviceId, "daily")}
                            disabled={Boolean(limitForms[serviceId]?.dailyLoading)}
                            className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {limitForms[serviceId]?.dailyLoading ? "Saving..." : "Save"}
                          </button>
                          {limitForms[serviceId]?.dailyError && (
                            <p className="mt-2 text-xs text-red-700">{limitForms[serviceId].dailyError}</p>
                          )}
                          {limitForms[serviceId]?.dailySuccess && (
                            <p className="mt-2 text-xs text-emerald-700">{limitForms[serviceId].dailySuccess}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Staff Summary</h2>
          

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StaffListBlock title="Active Staff" staff={activeStaff} />
            <StaffListBlock title="Inactive Staff" staff={inactiveStaff} />
            <StaffListBlock title="Unassigned Staff" staff={unassignedStaff} />
          </div>
        </section>
      )}
    </div>
  );
}
