import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getOrganizationAdminsByTenant } from "../../services/tenantService";

<<<<<<< HEAD
const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);
=======
const formatStatusLabel = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (!normalizedStatus) {
    return "Unknown";
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const getStatusBadgeClasses = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (normalizedStatus === "active") {
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  }

  if (normalizedStatus === "inactive") {
    return "bg-slate-100 text-slate-600 ring-slate-200";
  }

  return "bg-blue-100 text-blue-700 ring-blue-200";
};
>>>>>>> main

export default function HospitalSuperAdminBranchAdmins() {
  const location = useLocation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    let isMounted = true;

    const loadAdmins = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrganizationAdminsByTenant("hospital");
        if (!isMounted) {
          return;
        }

        setAdmins(Array.isArray(response) ? response : []);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setAdmins([]);
        setError(loadError?.message || "Failed to load hospital admins");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAdmins();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Registered Admins</h1>
        <p className="mt-2 text-gray-600">Create and manage hospital administrators</p>

        {successMessage && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

<<<<<<< HEAD
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-3">Assignment</div>
            <div className="col-span-3">Status</div>
          </div>

          {loading && (
            <div className="px-4 py-6 text-sm text-gray-600">Loading admins...</div>
          )}

          {!loading && admins.map((admin) => (
            <div key={admin.id} className="grid grid-cols-12 items-center border-b border-gray-100 px-4 py-3 text-sm last:border-b-0">
              <div className="col-span-3 font-medium text-gray-900">{admin.name}</div>
              <div className="col-span-3 text-gray-700">{admin.email}</div>
              <div className="col-span-3 text-gray-700">
                <p>{admin.organizationName || "-"}</p>
                <p className="text-xs text-gray-500">{admin.branchName || "-"}</p>
              </div>
              <div className="col-span-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    admin.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {formatStatusLabel(admin.status)}
                </span>
              </div>
            </div>
          ))}

          {!loading && !error && admins.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No hospital organization admins found.</div>
          )}
=======
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-[900px] w-full border-collapse text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-sm text-gray-600">
                    Loading admins...
                  </td>
                </tr>
              )}

              {!loading && admins.map((admin) => (
                <tr key={admin.id} className="transition hover:bg-gray-50/80">
                  <td className="px-6 py-4 align-top">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{admin.name || "Unnamed Admin"}</p>
                      <p className="mt-1 text-xs text-gray-500 break-words">
                        {admin.role || "Organization Admin"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-top">
                    <div className="max-w-[320px] min-w-0 break-words text-sm text-gray-700">
                      {admin.email || "-"}
                    </div>
                  </td>

                  <td className="px-6 py-4 align-top">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium text-gray-900">
                        {admin.organizationName || "-"}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {admin.branchName || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle text-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClasses(admin.status)}`}
                    >
                      {formatStatusLabel(admin.status)}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && !error && admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-sm text-gray-500">
                    No hospital organization admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
>>>>>>> main
        </div>
      </div>
    </div>
  );
}
