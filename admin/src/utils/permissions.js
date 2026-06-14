import { CANONICAL_ROLES, normalizeRole } from "../context/AuthContext";
import { TENANT_TEXT } from "./tenantTextConfig";

// Role hierarchy and capabilities
export const roleHierarchy = {
  [CANONICAL_ROLES.POLICE_SUPER_ADMIN]: {
    label: "Police Super Admin",
    dashboardPath: "/police-super-admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]: {
    label: "Hospital Super Admin",
    dashboardPath: "/hospital-super-admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.BANK_SUPER_ADMIN]: {
    label: "Bank Super Admin",
    dashboardPath: "/bank-super-admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: true,
    canViewReports: true,
  },
  [CANONICAL_ROLES.ORGANIZATION_ADMIN]: {
    label: "Organization Admin",
    dashboardPath: "/organization-admin/dashboard",
    canManageOrganizations: false,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.BRANCH_ADMIN]: {
    label: "Branch Admin",
    dashboardPath: "/branch-admin/dashboard",
    canManageOrganizations: false,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: false,
    canViewReports: false,
  },
  [CANONICAL_ROLES.STAFF]: {
    label: "Staff",
    dashboardPath: "/staff/dashboard",
    canManageOrganizations: false,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: false,
    canViewReports: false,
  },
  [CANONICAL_ROLES.DOCTOR]: {
    label: "Doctor",
    dashboardPath: "/doctor/dashboard",
    canManageOrganizations: false,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: false,
    canViewReports: false,
  },
};

// Route-level access control
const routeRoleMap = {
  "/police-super-admin": [CANONICAL_ROLES.POLICE_SUPER_ADMIN],
  "/hospital-super-admin": [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN],
  "/bank-super-admin": [CANONICAL_ROLES.BANK_SUPER_ADMIN],
  "/organization-admin": [CANONICAL_ROLES.ORGANIZATION_ADMIN],
  "/branch-admin": [CANONICAL_ROLES.BRANCH_ADMIN],
  "/staff": [CANONICAL_ROLES.STAFF],
  "/doctor": [CANONICAL_ROLES.DOCTOR],
};

export const isSuperAdmin = (role) => 
  role === CANONICAL_ROLES.POLICE_SUPER_ADMIN ||
  role === CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN ||
  role === CANONICAL_ROLES.BANK_SUPER_ADMIN;

export const isOrgAdmin = (role) => role === CANONICAL_ROLES.ORGANIZATION_ADMIN;

export const isBranchAdmin = (role) => role === CANONICAL_ROLES.BRANCH_ADMIN;

export const isStaff = (role) => role === CANONICAL_ROLES.STAFF;

export const isDoctor = (role) => role === CANONICAL_ROLES.DOCTOR;

export const canAccessRoute = (role, path) => {
  if (!role || !path) {
    return false;
  }

  const matchedPrefix = Object.keys(routeRoleMap).find((prefix) => path.startsWith(prefix));
  if (!matchedPrefix) {
    return true;
  }

  return routeRoleMap[matchedPrefix].includes(role);
};

export const getDefaultDashboardPath = (role) => {
  const normalizedRole = normalizeRole(role);
  const config = roleHierarchy[normalizedRole];
  if (config) {
    return config.dashboardPath;
  }
  return "/login";
};

export const getRoleLabel = (role, tenantType = null) => {
  const normalizedRole = normalizeRole(role);
  const normalizedTenantType = String(tenantType || "").trim().toLowerCase();

  if (normalizedTenantType) {
    const tenantLabel = TENANT_TEXT[normalizedTenantType]?.roleLabels?.[normalizedRole];
    if (tenantLabel) {
      return tenantLabel;
    }
  }

  const config = roleHierarchy[normalizedRole];
  return config ? config.label : "Unknown Role";
};

export const hasCapability = (role, capability) => {
  const config = roleHierarchy[role];
  return config ? config[capability] : false;
};

export const roleSidebarLinks = {
  [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]: [
    { label: "Dashboard", to: "/hospital-super-admin/dashboard" },
    { label: "Districts", to: "/hospital-super-admin/registered-hospitals" },
    { label: "Hospitals", to: "/hospital-super-admin/branches" },
    { label: "Hospital Requests", to: "/hospital-super-admin/branch-requests" },
    { label: "District Admins", to: "/hospital-super-admin/hospital-admins" },
    { label: "Reports", to: "/hospital-super-admin/reports" },
  ],
  [CANONICAL_ROLES.POLICE_SUPER_ADMIN]: [
    { label: "Dashboard", to: "/police-super-admin/dashboard" },
    { label: "Main Divisions", to: "/police-super-admin/main-division" },
    { label: "Police Stations", to: "/police-super-admin/branches" },
    { label: "Police Station Requests", to: "/police-super-admin/branch-requests" },
    { label: "Division Admins", to: "/police-super-admin/branch-admins" },
    { label: "Reports", to: "/police-super-admin/reports" },
  ],
  [CANONICAL_ROLES.BANK_SUPER_ADMIN]: [
    { label: "Dashboard", to: "/bank-super-admin/dashboard" },
    { label: "Organizations", to: "/bank-super-admin/organizations" },
    { label: "Branches", to: "/bank-super-admin/branches" },
    { label: "Branch Requests", to: "/bank-super-admin/branch-requests" },
    { label: "Organization Admins", to: "/bank-super-admin/organization-admins" },
    { label: "Reports", to: "/bank-super-admin/reports" },
  ],
  [CANONICAL_ROLES.ORGANIZATION_ADMIN]: [
    { label: "Dashboard", to: "/organization-admin/dashboard" },
    { label: "Branches", to: "/organization-admin/branches" },
    { label: "Branch Admins", to: "/organization-admin/branch-admins" },
    { label: "Services", to: "/organization-admin/services" },
    { label: "Settings", to: "/organization-admin/settings" },
    { label: "Reports", to: "/organization-admin/reports" },
  ],
  [CANONICAL_ROLES.BRANCH_ADMIN]: [
    { label: "Dashboard", to: "/branch-admin/dashboard" },
    { label: "Staff", to: "/branch-admin/staff" },
    { label: "Operations", to: "/branch-admin/operations" },
    { label: "Branch Details", to: "/branch-admin/branch-details" },
    { label: "Settings", to: "/branch-admin/settings" },
  ],
  [CANONICAL_ROLES.STAFF]: [
    { label: "Dashboard", to: "/staff/dashboard" },
    { label: "Profile", to: "/staff/profile" },
    { label: "Tasks", to: "/staff/tasks" },
  ],
  [CANONICAL_ROLES.DOCTOR]: [
    { label: "Dashboard", to: "/doctor/dashboard" },
    { label: "Profile", to: "/doctor/profile" },
  ],
};

export const getSidebarLinksByRole = (role, tenantType = null) => {
  const normalizedRole = normalizeRole(role);
  let links = roleSidebarLinks[normalizedRole] || [];

  const normalizedTenantType = String(tenantType || "").trim().toLowerCase();

  if (
    normalizedTenantType &&
    normalizedRole === CANONICAL_ROLES.ORGANIZATION_ADMIN
  ) {
    const sidebar = TENANT_TEXT[normalizedTenantType]?.sidebar;

    if (sidebar) {
      links = links.map((link) => {
        if (link.to === "/organization-admin/branches") {
          return {
            ...link,
            label: sidebar.branches || link.label,
          };
        }

        if (link.to === "/organization-admin/branch-admins") {
          return {
            ...link,
            label: sidebar.branchAdmins || link.label,
          };
        }

        return link;
      });
    }
  }

  return links;
};
