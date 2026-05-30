import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTenant } from "../../context/TenantContext";
import { legacyStorageKeys, readValue, storageKeys, writeValue } from "../../utils/storage";
import {
  getBranchesForOrganization,
  getServicesForTenantSelection,
} from "../../services/tenantSelectionService";

export default function TenantHome() {
  const { tenantType, tenant, theme, clearSelection, selectedOrganizationId } = useTenant();
  const navigate = useNavigate();
  
  // Search bar එක සඳහා අලුත් state එක
  const [searchTerm, setSearchTerm] = useState("");
  
  const [branches, setBranches] = useState([]);
  const [branchServicesMap, setBranchServicesMap] = useState({});
  const selectedOrganization =
    readValue(localStorage, storageKeys.selectedOrganization(tenantType), [legacyStorageKeys.selectedOrganization]) ||
    "";

  useEffect(() => {
    let isMounted = true;

    const loadTenantData = async () => {
      if (!tenantType) return;

      const orgIdKey = `queueflow_${tenantType}_selectedOrganization_id`;
      const idFromStorage = localStorage.getItem(orgIdKey);
      
      const finalOrgId = (selectedOrganizationId || idFromStorage || "").trim();

      if (!finalOrgId || finalOrgId === "undefined" || finalOrgId === "") {
        setBranches([]);
        setBranchServicesMap({});
        return;
      }

      try {
        const fetchedBranches = await getBranchesForOrganization(tenantType, finalOrgId);

        if (!isMounted) return;

        const normalizedBranches = Array.isArray(fetchedBranches) ? fetchedBranches : [];
        setBranches(normalizedBranches);

        const serviceResults = await Promise.all(
          normalizedBranches.map(async (branch) => {
            const branchId = String(branch?.id || branch?._id || "").trim();

            if (!branchId) {
              return { branchId: "", services: [] };
            }

            try {
              const services = await getServicesForTenantSelection({ tenantType, branchId });
              return {
                branchId,
                services: Array.isArray(services) ? services : [],
              };
            } catch (branchServiceError) {
              console.error("Failed to fetch services for branch:", branchId, branchServiceError);
              return {
                branchId,
                services: [],
              };
            }
          })
        );

        if (!isMounted) return;

        const nextBranchServicesMap = {};
        serviceResults.forEach(({ branchId, services: branchServices }) => {
          if (!branchId) {
            return;
          }

          nextBranchServicesMap[branchId] = branchServices;
        });

        setBranchServicesMap(nextBranchServicesMap);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    loadTenantData();
    return () => { isMounted = false; };
  }, [tenantType, selectedOrganizationId]);

  const effectiveBranches = branches
    .map((branch) => {
      if (typeof branch === "string") {
        const name = branch.trim();
        return name ? { id: name, branchName: name } : null;
      }

      const id = String(branch?.id || branch?._id || "").trim();
      const branchName = (branch?.branchName || branch?.name || "").trim();

      if (!branchName) {
        return null;
      }

      return {
        ...branch,
        id: id || branchName,
        branchName,
      };
    })
    .filter(Boolean);

  // Search term එකට අනුව branches filter කිරීම
  const filteredBranches = effectiveBranches.filter((branch) =>
    String(branch?.branchName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const heroTitle = selectedOrganization || tenant.name;

  const handleGetToken = () => {
    writeValue(sessionStorage, storageKeys.queueFlowStarted(tenantType), "true");
    navigate(`/${tenantType}/branches`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section (වෙනස් කරලා නෑ) */}
      <section className={`rounded-3xl bg-gradient-to-r ${theme.gradient} p-8 text-white shadow-lg`}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
          Welcome
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{heroTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
          {tenant.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGetToken}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Get Token
          </button>
          <Link
            to={`/${tenantType}/queue-status`}
            className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View Queue
          </Link>
        </div>
      </section>

      {/* අලුතින් එකතු කරපු Search සහ Branches Section එක */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Our Branches</h2>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Branches සහ Services පෙන්වන Grid එක */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <div key={branch.id} className={`rounded-2xl border ${theme.border} bg-white p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col`}>
                {/* Branch Name */}
                <h3 className="text-lg font-bold text-slate-900">{branch.branchName}</h3>
                
                {/* Branch එකට අදාල Services */}
                <div className="mt-4 flex-grow">
                  <p className="mb-3 text-sm font-semibold text-slate-600">Available Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {(branchServicesMap[branch.id] || []).length > 0 ? (
                      (branchServicesMap[branch.id] || []).map((service) => (
                        <span
                          key={service.id || service.serviceName}
                          className={`rounded-lg border ${theme.border} ${theme.soft} ${theme.text} px-2.5 py-1 text-xs font-medium`}
                        >
                          {service.serviceName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No services available</span>
                    )}
                  </div>
                </div>
                
                {/* Booking Type එක */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
                    {tenant.bookingType || 'Token'} Booking
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <p className="text-slate-500">No branches found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}