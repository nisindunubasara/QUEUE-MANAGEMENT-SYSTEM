import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SlideOver from "../../components/common/SlideOver";
import { Building2, MapPin, User, BadgeCheck, Clock } from "lucide-react";
import {
  approveBranchRequest,
  getPendingBranchRequests,
  rejectBranchRequest,
} from "../../services/branchRequestService";

const normalizeTenantType = (request) =>
  String(request?.tenantType || request?.tenant || "")
    .trim()
    .toLowerCase();

const getRequestedByLabel = (requestedBy) => {
  if (!requestedBy) return "-";
  if (typeof requestedBy === "string") return requestedBy;

  return (
    requestedBy?.name ||
    requestedBy?.username ||
    requestedBy?.email ||
    requestedBy?.fullName ||
    "-"
  );
};

const getOrganizationName = (request) =>
  request?.organizationName ||
  request?.organization?.organizationName ||
  request?.organization?.name ||
  request?.organizationId?.organizationName ||
  request?.organizationId?.name ||
  "-";

const getBranchName = (request) =>
  request?.branchName || request?.branch?.branchName || request?.name || "-";

const getCity = (request) => request?.city || request?.branch?.city || "-";

const getStatusBadgeClass = (status = "") => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (normalized === "rejected" || normalized === "inactive") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-blue-100 text-blue-700";
};

export default function SharedSuperAdminBranchRequests() {
  const { tenantType } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const pageTitle = "Branch Requests";
  const pageSubtitle = `Review and manage pending branch requests for your ${tenantType} network`;
  const tableTitle = `Pending ${tenantType.charAt(0).toUpperCase() + tenantType.slice(1)} Requests`;

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoading(true);
      }

      if (isMounted) {
        setError("");
      }

      try {
        const response = await getPendingBranchRequests();
        if (!isMounted) {
          return;
        }

        const rawRequests = Array.isArray(response?.branchRequests) ? response.branchRequests : [];

        const filteredRequests = rawRequests.filter((request) =>
          normalizeTenantType(request) === tenantType
        );

        if (isMounted) {
          setRequests(filteredRequests);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err?.message || "Failed to fetch pending branch requests.");
        setRequests([]);
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchRequests(true);

    const intervalId = setInterval(() => {
      fetchRequests(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [tenantType]);

  const handleApprove = async (requestId) => {
    setActionLoadingId(requestId);
    setError("");

    try {
      await approveBranchRequest(requestId);
      setRequests((prev) => prev.filter((req) => (req?._id || req?.id) !== requestId));
    } catch (err) {
      setError(err?.message || "Failed to approve branch request.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (requestId) => {
    setActionLoadingId(requestId);
    setError("");

    try {
      await rejectBranchRequest(requestId);
      setRequests((prev) => prev.filter((req) => (req?._id || req?.id) !== requestId));
    } catch (err) {
      setError(err?.message || "Failed to reject branch request.");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
        <p className="mt-2 text-sm text-slate-500">{pageSubtitle}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading pending branch requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No pending branch requests found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            {tableTitle}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Branch Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Organization Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">City</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Requested By</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => {
                  const requestId = request?._id || request?.id;
                  const actionBusy = actionLoadingId === requestId;
                  const status = String(request?.status || "pending").trim().toLowerCase();

                  return (
                    <tr
                      key={requestId}
                      onClick={() => setSelectedItem(request)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-900">{getBranchName(request)}</td>
                      <td className="px-4 py-3 text-slate-700">{getOrganizationName(request)}</td>
                      <td className="px-4 py-3 text-slate-700">{getCity(request)}</td>
                      <td className="px-4 py-3 text-slate-700">{getRequestedByLabel(request?.requestedBy)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(requestId)}
                            disabled={actionBusy}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionBusy ? "Processing..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(requestId)}
                            disabled={actionBusy}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionBusy ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SlideOver
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Branch Request Details"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{getBranchName(selectedItem)}</h3>
                  <p className="mt-1 text-sm text-slate-500">Pending branch request overview</p>
                </div>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  selectedItem.status
                )}`}
              >
                {String(selectedItem?.status || "pending").charAt(0).toUpperCase() + String(selectedItem?.status || "pending").slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-sky-700 shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getCity(selectedItem)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requested By</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getRequestedByLabel(selectedItem?.requestedBy)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-indigo-700 shadow-sm">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getOrganizationName(selectedItem)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-amber-700 shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request Status</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {String(selectedItem?.status || "pending").charAt(0).toUpperCase() + String(selectedItem?.status || "pending").slice(1)}
                    </p>
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