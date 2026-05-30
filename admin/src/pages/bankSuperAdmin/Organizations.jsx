import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBranchesByTenant, getOrganizationsByTenant } from "../../services/tenantService";
import SlideOver from "../../components/common/SlideOver";
import { Building2, MapPin, Activity, Hash } from "lucide-react";

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

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

const normalizeOrganization = (organization = {}, branchCountMap = {}) => {
  const id = organization?._id || organization?.id || null;

  return {
    id,
    name: organization?.organizationName || "Unnamed Organization",
    address: organization?.address || "N/A",
    branches: branchCountMap[String(id || "")] || 0,
    status: organization?.status || "inactive",
  };
};

const ITEMS_PER_PAGE = 10;

function OrganizationTable({ title, data, onAdd, addLabel, onEdit, onDelete, onViewDetails }) {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((org) => {
      const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || org.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {addLabel}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search organization..."
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
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Location</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Branches</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((org) => (
              <tr
                key={org.id}
                onClick={() => setSelectedOrg(org)}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{org.name}</td>
                <td className="px-4 py-3 text-slate-600">{org.address}</td>
                <td className="px-4 py-3 text-slate-600">{org.branches}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      org.status
                    )}`}
                  >
                    {formatStatusLabel(org.status)}
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

        <span>Page {page} of {totalPages || 1}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <SlideOver
        open={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title="Organization Details"
      >
        {selectedOrg && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedOrg.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Organization overview and system details</p>
                </div>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  selectedOrg.status
                )}`}
              >
                {formatStatusLabel(selectedOrg.status)}
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
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedOrg.address}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Branches</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedOrg.branches}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-indigo-700 shadow-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">System ID</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedOrg.id || "-"}</p>
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

export default function Organizations() {
  const navigate = useNavigate();
  const [bankOrganizations, setBankOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        const [bankOrgs, bankBranches] = await Promise.all([
          getOrganizationsByTenant("bank"),
          getBranchesByTenant("bank"),
        ]);

        if (!isMounted) {
          return;
        }

        const branchCountMap = {};
        bankBranches.forEach((b) => {
          const key = String(b.organizationId);
          branchCountMap[key] = (branchCountMap[key] || 0) + 1;
        });

        if (isMounted) {
          setBankOrganizations(bankOrgs.map((o) => normalizeOrganization(o, branchCountMap)));
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchData(true);

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading organizations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organizations</h1>
      <p className="mt-2 text-sm text-slate-500">Manage and view all organizations</p>

      <OrganizationTable
        title="Bank Organizations"
        data={bankOrganizations}
        addLabel="Add Bank"
        onAdd={() => navigate("/bank-super-admin/add-bank")}
        onEdit={(o) => console.log(o)}
        onDelete={(id) => setBankOrganizations((prev) => prev.filter((i) => i.id !== id))}
        onViewDetails={(o) => console.log(o)}
      />
    </div>
  );
}