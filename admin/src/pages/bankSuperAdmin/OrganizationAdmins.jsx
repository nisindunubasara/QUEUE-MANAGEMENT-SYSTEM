import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getOrganizationAdminsByTenant } from "../../services/tenantService";
import SlideOver from "../../components/common/SlideOver";
import { Building2, Mail, ShieldCheck, User, BadgeCheck } from "lucide-react";

const formatStatusLabel = (status = "") => {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
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

export default function BankSuperAdminOrganizationAdmins() {
  const location = useLocation();
  const [admins, setAdmins] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    let isMounted = true;

    const loadAdmins = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        if (isMounted) {
          setError("");
        }

        const bankAdmins = await getOrganizationAdminsByTenant("bank");

        if (!isMounted) {
          return;
        }

        if (isMounted) {
          setAdmins(Array.isArray(bankAdmins) ? bankAdmins : []);
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        if (isMounted) {
          setAdmins([]);
          setError(loadError?.message || "Failed to load organization admins");
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    loadAdmins(true);

    const intervalId = setInterval(() => {
      loadAdmins(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organization Admins</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and manage organization administrators for banks
        </p>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-emerald-700">{successMessage}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading organization admins...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && admins.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No organization admins yet</p>
        </div>
      )}

      {!loading && !error && admins.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Organization</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin._id || admin.id}
                    onClick={() => setSelectedItem(admin)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{admin.name || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{admin.email || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{admin.username || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{admin.organizationName || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          admin.status
                        )}`}
                      >
                        {formatStatusLabel(admin.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <SlideOver
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Organization Admin Details"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedItem.name || "-"}</h3>
                  <p className="mt-1 text-sm text-slate-500">Organization admin account details</p>
                </div>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  selectedItem.status
                )}`}
              >
                {formatStatusLabel(selectedItem.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-sky-700 shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.name || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-indigo-700 shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.email || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.username || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.organizationName || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
