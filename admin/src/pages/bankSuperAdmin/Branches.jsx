import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import SlideOver from "../../components/common/SlideOver";
import { Building2, MapPin, Hash, Activity } from "lucide-react";

const formatStatusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

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

const normalizeBranch = (branch) => ({
  id: branch?._id || branch?.id,
  branchName: branch?.branchName || "-",
  organizationName:
    branch?.organizationName ||
    branch?.organization?.organizationName ||
    branch?.organization?.name ||
    "-",
  location: branch?.city || branch?.address || "-",
  branchCode: branch?.branchCode || "-",
  status: String(branch?.status || "inactive").toLowerCase(),
  tenantType: String(branch?.tenantType || "").toLowerCase(),
});

const ITEMS_PER_PAGE = 10;

function BranchTable({ title, data }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((branch) => {
      const matchSearch =
        branch.branchName.toLowerCase().includes(search.toLowerCase()) ||
        branch.organizationName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || branch.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Branch Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Organization</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Location</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Branch Code</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((branch) => (
              <tr
                key={branch.id}
                onClick={() => setSelectedItem(branch)}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{branch.branchName}</td>
                <td className="px-4 py-3 text-slate-600">{branch.organizationName}</td>
                <td className="px-4 py-3 text-slate-600">{branch.location}</td>
                <td className="px-4 py-3 text-slate-600">{branch.branchCode}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      branch.status
                    )}`}
                  >
                    {formatStatusLabel(branch.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <SlideOver
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Branch Details"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedItem.branchName}</h3>
                  <p className="mt-1 text-sm text-slate-500">Branch overview and system details</p>
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
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.location}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Branch Code</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.branchCode}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-indigo-700 shadow-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedItem.organizationName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}

export default function BankSuperAdminBranches() {
  const [bankBranches, setBankBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchBranches = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        if (isMounted) {
          setError("");
        }

        const response = await api.get("/branches");

        const rawBranches = Array.isArray(response?.data?.branches)
          ? response.data.branches
          : [];

        const normalized = rawBranches.map(normalizeBranch);

        if (!isMounted) return;

        if (isMounted) {
          setBankBranches(normalized.filter((b) => b.tenantType === "bank"));
        }
      } catch (err) {
        if (!isMounted) return;

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to fetch branches"
          );
        }
      } finally {
        if (isMounted && isInitialLoad) setLoading(false);
      }
    };

    fetchBranches(true);

    const intervalId = setInterval(() => {
      fetchBranches(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500">Loading branches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Branch Management</h1>
      <p className="mt-2 text-sm text-slate-500">Manage and view all bank branches</p>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      <BranchTable
        title="Bank Branches"
        data={bankBranches}
      />
    </div>
  );
}