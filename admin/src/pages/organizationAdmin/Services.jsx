import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TENANT_TEXT } from "../../utils/tenantTextConfig";
import { getOrganizationBranchServices } from "../../services/organizationAdminService";

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

// Shared organization-admin page for tenant-scoped service catalog management.
export default function SharedOrganizationAdminServices() {
  const navigate = useNavigate();
  const { tenantType } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedTenantType = String(tenantType || "").trim().toLowerCase();
  const textConfig =
    TENANT_TEXT[normalizedTenantType]?.orgAdminPages?.services || TENANT_TEXT.bank.orgAdminPages.services;
  const showDivisionServices = normalizedTenantType === "police";

  const divisionServices = branches.flatMap((branch) => {
    const services = Array.isArray(branch.services)
      ? branch.services
      : Array.isArray(branch.branchServices)
        ? branch.branchServices
        : [];

    return services
      .filter((service) => Boolean(service?.isDivisionService))
      .map((service) => ({
        ...service,
        sourceBranchId: branch.branchId,
        sourceBranchName: branch.branchName,
      }));
  });

  const groupedServices = branches.reduce((accumulator, branch) => {
    const services = Array.isArray(branch.services)
      ? branch.services
      : Array.isArray(branch.branchServices)
        ? branch.branchServices
        : [];

    services
      .filter((service) => !Boolean(service?.isDivisionService))
      .forEach((service) => {
        const serviceName = service?.serviceName || "Unnamed Service";

        if (!accumulator[serviceName]) {
          accumulator[serviceName] = {
            serviceName,
            description: service?.description || "-",
            branches: [],
          };
        }

        accumulator[serviceName].branches.push({
          branchName: branch.branchName || "Unnamed Branch",
          description: service?.description || "-",
          status: service?.status,
        });
      });

    return accumulator;
  }, {});

  useEffect(() => {
    let isMounted = true;

    const loadBranchServices = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        if (isMounted) {
          setError("");
        }

        const data = await getOrganizationBranchServices();
        if (!isMounted) {
          return;
        }

        if (isMounted) {
          setBranches(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (isMounted) {
          setError(err?.message || "Failed to load services");
          setBranches([]);
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    loadBranchServices(true);

    const intervalId = setInterval(() => {
      loadBranchServices(false);
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{textConfig.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{textConfig.subtitle}</p>
        </div>

        <button
          onClick={() => navigate("/organization-admin/add-service")}
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          {textConfig.addBtn}
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading services...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && branches.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">{textConfig.noData}</p>
        </div>
      )}

      {!loading && !error && branches.length > 0 && showDivisionServices && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{textConfig.divisionServicesTitle}</h2>

          {divisionServices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">{textConfig.noDivisionServices}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Service Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">{textConfig.branchCol}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {divisionServices.map((service) => (
                    <tr
                      key={
                        service.id ||
                        service.serviceId ||
                        `${service.sourceBranchId}_${service.serviceName}`
                      }
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{service.serviceName || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{service.description || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{service.sourceBranchName || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            service.status
                          )}`}
                        >
                          {formatStatusLabel(service.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!loading &&
        !error &&
        Object.values(groupedServices).map((group) => (
          <section
            key={group.serviceName}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">{group.serviceName}</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">{group.description || "-"}</p>

            {group.branches.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{textConfig.noBranchesOffer}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">{textConfig.branchCol}</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.branches.map((branch, index) => (
                      <tr
                        key={`${group.serviceName}_${branch.branchName}_${index}`}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{branch.branchName}</td>
                        <td className="px-4 py-3">
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
            )}
          </section>
        ))}
    </div>
  );
}
