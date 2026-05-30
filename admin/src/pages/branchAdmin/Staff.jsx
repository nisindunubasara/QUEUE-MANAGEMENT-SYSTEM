import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBranchStaffUsers } from "../../services/branchAdminService";
import SlideOver from "../../components/common/SlideOver";
import { BadgeCheck, Mail, Phone, ShieldCheck, User } from "lucide-react";

const formatStatusLabel = (status = "") => {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getRoleBadgeClass = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase();

  if (normalized === "doctor") {
    return "bg-indigo-100 text-indigo-700";
  }

  if (normalized === "staff") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-slate-100 text-slate-700";
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

export default function BranchAdminStaff() {
  const navigate = useNavigate();
  const { tenantType } = useAuth();
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isHospitalTenant = String(tenantType || "").trim().toLowerCase() === "hospital";

  useEffect(() => {
    let isMounted = true;

    const loadStaffUsers = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError("");

        const data = await getBranchStaffUsers();
        if (!isMounted) {
          return;
        }

        setStaffUsers(Array.isArray(data?.staff) ? data.staff : []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err?.message || "Failed to load staff users");
        setStaffUsers([]);
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    loadStaffUsers(true);

    const intervalId = setInterval(() => {
      loadStaffUsers(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage staff members for your branch</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/branch-admin/add-staff")}
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            + Add Staff
          </button>

          {isHospitalTenant && (
            <button
              onClick={() => navigate("/branch-admin/add-doctor")}
              className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              + Add Doctor
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading staff users...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && staffUsers.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No staff users found</p>
        </div>
      )}

      {!loading && !error && staffUsers.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map((staff) => (
                  <tr
                    key={staff.id}
                    onClick={() => setSelectedItem(staff)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{staff.name || "-"}</td>
                    <td className="px-4 py-3 max-w-[280px] truncate text-slate-600" title={staff.email || ""}>
                      {staff.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{staff.username || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{staff.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getRoleBadgeClass(
                          staff.role
                        )}`}
                      >
                        {formatStatusLabel(staff.role || "staff")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          staff.status
                        )}`}
                      >
                        {formatStatusLabel(staff.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <SlideOver open={!!selectedItem} onClose={() => setSelectedItem(null)} title="Staff Details">
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedItem.name || "-"}</h3>
                  <p className="mt-1 text-sm text-slate-500">Branch staff member details</p>
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
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.phone || "-"}</p>
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
