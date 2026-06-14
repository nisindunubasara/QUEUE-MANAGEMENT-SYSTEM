import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TENANT_TEXT } from "../../utils/tenantTextConfig";
import {
  getBranchAdminOperationsDashboard,
  updateBranchOperatingHours,
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

export default function BranchAdminDetails() {
  const { tenantType } = useAuth();
  const textConfig = TENANT_TEXT[tenantType]?.branchAdminPages?.branchDetails || TENANT_TEXT.bank.branchAdminPages.branchDetails;
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLimitDate, setSelectedLimitDate] = useState(new Date().toISOString().split("T")[0]);
  const [operatingHoursForms, setOperatingHoursForms] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBranchAdminOperationsDashboard();
        if (!isMounted) return;

        setDashboard(data || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load branch operations");
        setDashboard(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Initialize operating hours forms from dashboard.branch.operatingHours
    setOperatingHoursForms(() => {
      const operatingList = Array.isArray(dashboard?.branch?.operatingHours) ? dashboard.branch.operatingHours : [];
      const nextState = {};
      upcomingDates.forEach((date) => {
        const found = operatingList.find((entry) => String(entry?.date || "") === String(date));
        nextState[date] = {
          openTime: found?.openTime || "",
          closeTime: found?.closeTime || "",
          loading: false,
          error: "",
          success: "",
        };
      });

      return nextState;
    });
  }, [dashboard]);

  const handleOperatingHoursChange = (date, field, value) => {
    setOperatingHoursForms((current) => ({
      ...current,
      [date]: {
        ...(current[date] || { openTime: "", closeTime: "", loading: false, error: "", success: "" }),
        [field]: value,
        error: "",
        success: "",
      },
    }));
  };

  const handleSaveOperatingHours = async () => {
    const payload = upcomingDates.map((date) => {
      const entry = operatingHoursForms[date] || { openTime: "", closeTime: "" };
      return {
        date,
        openTime: entry.openTime || "",
        closeTime: entry.closeTime || "",
      };
    });

    try {
      setOperatingHoursForms((current) => ({
        ...current,
        [selectedLimitDate]: { ...(current[selectedLimitDate] || {}), loading: true, error: "", success: "" },
      }));

      const response = await updateBranchOperatingHours(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update operating hours");
      }

      // Update dashboard branch operating hours
      setDashboard((current) => {
        if (!current) return current;
        return {
          ...current,
          branch: {
            ...(current.branch || {}),
            operatingHours: response?.data?.operatingHours || response?.operatingHours || [],
          },
        };
      });

      setOperatingHoursForms((current) => {
        const next = { ...current };
        upcomingDates.forEach((date) => {
          next[date] = {
            ...(next[date] || { openTime: "", closeTime: "" }),
            loading: false,
            error: "",
            success: "Operating hours saved",
          };
        });
        return next;
      });
    } catch (err) {
      setOperatingHoursForms((current) => ({
        ...current,
        [selectedLimitDate]: { ...(current[selectedLimitDate] || {}), loading: false, error: err?.message || "Failed to save hours", success: "" },
      }));
    }
  };

  const branchName = dashboard?.branch?.branchName || "-";

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">{textConfig.loadingText || "Loading branch details..."}</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{textConfig.pageTitle}</h1>
      <p className="mt-2 text-sm text-slate-500">{textConfig.pageSubtitle} {branchName}</p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{branchName}</h2>

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

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{textConfig.opHoursTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">Set open and close times for the selected date.</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
            <div>
                <label className="block text-sm font-medium text-slate-700">{textConfig.openTimeLabel}</label>
              <input
                type="time"
                value={operatingHoursForms[selectedLimitDate]?.openTime || ""}
                onChange={(e) => handleOperatingHoursChange(selectedLimitDate, "openTime", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">{textConfig.closeTimeLabel}</label>
              <input
                type="time"
                value={operatingHoursForms[selectedLimitDate]?.closeTime || ""}
                onChange={(e) => handleOperatingHoursChange(selectedLimitDate, "closeTime", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveOperatingHours}
                disabled={Boolean(operatingHoursForms[selectedLimitDate]?.loading)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {operatingHoursForms[selectedLimitDate]?.loading ? textConfig.savingBtn : textConfig.saveBtn}
              </button>
            </div>
          </div>

          {operatingHoursForms[selectedLimitDate]?.error && (
            <p className="mt-3 text-sm text-red-700">{operatingHoursForms[selectedLimitDate].error}</p>
          )}

          {operatingHoursForms[selectedLimitDate]?.success && (
            <p className="mt-3 text-sm text-emerald-700">{operatingHoursForms[selectedLimitDate].success}</p>
          )}
        </section>
      </div>
    </div>
  );
}
