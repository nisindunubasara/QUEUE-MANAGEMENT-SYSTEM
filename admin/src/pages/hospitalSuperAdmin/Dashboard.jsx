import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getBranchesByTenant,
  getOrganizationAdminsByTenant,
  getOrganizationsByTenant,
  getServicesByTenant,
} from "../../services/tenantService";

const formatStatusLabel = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (!normalizedStatus) {
    return "Unknown";
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const getStatusClassName = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  return normalizedStatus === "active"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";
};

const getTimestampValue = (item) => {
  const timestamp = item?.createdAt || item?.updatedAt || item?.created_at || item?.updated_at;
  const value = timestamp ? new Date(timestamp).getTime() : 0;

  return Number.isNaN(value) ? 0 : value;
};

const buildActivity = ({ id, type, name, timestamp, meta = {} }) => ({
  id,
  type,
  name,
  timestamp,
  meta,
});

const formatActivityLabel = (activity) => {
  switch (activity.type) {
    case "Hospital":
      return `New Hospital Added: ${activity.name}`;
    case "Branch":
      return `New Branch Added: ${activity.name}`;
    case "Service":
      return `New Service Added: ${activity.name}`;
    case "Admin":
      return `Admin Registered: ${activity.name}`;
    default:
      return activity.name;
  }
};

const getActivityBadgeClasses = (type) => {
  switch (type) {
    case "Hospital":
      return "bg-blue-100 text-blue-700";
    case "Branch":
      return "bg-emerald-100 text-emerald-700";
    case "Service":
      return "bg-violet-100 text-violet-700";
    case "Admin":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function HospitalSuperAdminDashboard() {
  const { user, tenantType } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [organizationData, branchData, serviceData, adminData] = await Promise.all([
          getOrganizationsByTenant("hospital"),
          getBranchesByTenant("hospital"),
          getServicesByTenant("hospital"),
          getOrganizationAdminsByTenant("hospital"),
        ]);

        if (!isMounted) {
          return;
        }

        setOrganizations(Array.isArray(organizationData) ? organizationData : []);
        setBranches(Array.isArray(branchData) ? branchData : []);
        setServices(Array.isArray(serviceData) ? serviceData : []);
        setBranchAdmins(Array.isArray(adminData) ? adminData : []);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load hospital dashboard data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentActivities = useMemo(() => {
    const hospitalActivities = organizations.map((organization, index) => {
      const name = organization.organizationName || organization.name || organization.hospitalName || "Unnamed Hospital";

      return buildActivity({
        id: organization.id || organization._id || `hospital-${index}`,
        type: "Hospital",
        name,
        timestamp: getTimestampValue(organization),
        meta: { status: organization.status },
      });
    });

    const branchActivities = branches.map((branch, index) => {
      const name = branch.branchName || branch.name || "Unnamed Branch";

      return buildActivity({
        id: branch.id || branch._id || `branch-${index}`,
        type: "Branch",
        name,
        timestamp: getTimestampValue(branch),
        meta: { status: branch.status },
      });
    });

    const serviceActivities = services.map((service, index) => {
      const name = service.serviceName || service.name || "Unnamed Service";

      return buildActivity({
        id: service.id || service._id || `service-${index}`,
        type: "Service",
        name,
        timestamp: getTimestampValue(service),
        meta: { status: service.status },
      });
    });

    const adminActivities = branchAdmins.map((admin, index) => {
      const name = admin.name || admin.fullName || admin.email || "Unnamed Admin";

      return buildActivity({
        id: admin.id || admin._id || `admin-${index}`,
        type: "Admin",
        name,
        timestamp: getTimestampValue(admin),
        meta: { status: admin.status },
      });
    });

    return [...hospitalActivities, ...branchActivities, ...serviceActivities, ...adminActivities]
      .sort((left, right) => right.timestamp - left.timestamp)
      .slice(0, 8);
  }, [organizations, branches, services, branchAdmins]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Hospital Super Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage hospitals, branches, and healthcare services</p>
        </div>

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading hospital dashboard data...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{organizations.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{branches.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{branchAdmins.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{services.length}</p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="mt-4 space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity available yet.</p>
                ) : (
                  recentActivities.map((activity) => {
                    return (
                      <div key={activity.id} className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getActivityBadgeClasses(activity.type)}`}>
                              {activity.type}
                            </span>
                            <p className="text-sm font-medium text-gray-900">{formatActivityLabel(activity)}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "Recently"}
                          </p>
                        </div>

                        {activity.meta?.status && (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(activity.meta.status)}`}>
                            {formatStatusLabel(activity.meta.status)}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {user && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
            <p className="text-sm text-gray-600">
              Logged in as <strong>{user.email}</strong> ({tenantType || "hospital"})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
