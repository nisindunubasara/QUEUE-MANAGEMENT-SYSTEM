import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthState, getStoredAuthState, logoutUserApi, saveAuthState, sendHeartbeatApi } from "../services/authService";

// Canonical role hierarchy (no normalization - each role is distinct).
// organization_admin is a shared role for police, bank, supermarket, and hospital tenants.
// Tenant isolation is represented through tenantType + organizationId + branchId.
export const CANONICAL_ROLES = {
  POLICE_SUPER_ADMIN: "police_super_admin",
  HOSPITAL_SUPER_ADMIN: "hospital_super_admin",
  BANK_SUPER_ADMIN: "bank_super_admin",
  ORGANIZATION_ADMIN: "organization_admin",
  BRANCH_ADMIN: "branch_admin",
  STAFF: "staff",
  DOCTOR: "doctor",
};

export const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  const lowerRole = String(role).toLowerCase();

  // Map role to canonical form
  const roleMap = {
    police_super_admin: CANONICAL_ROLES.POLICE_SUPER_ADMIN,
    hospitaladmin: CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN,
    hospital_super_admin: CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN,
    bankadmin: CANONICAL_ROLES.BANK_SUPER_ADMIN,
    bank_super_admin: CANONICAL_ROLES.BANK_SUPER_ADMIN,
    superadmin: CANONICAL_ROLES.BANK_SUPER_ADMIN,
    organization_admin: CANONICAL_ROLES.ORGANIZATION_ADMIN,
    org_admin: CANONICAL_ROLES.ORGANIZATION_ADMIN,
    branch_admin: CANONICAL_ROLES.BRANCH_ADMIN,
    branchadmin: CANONICAL_ROLES.BRANCH_ADMIN,
    staff: CANONICAL_ROLES.STAFF,
    doctor: CANONICAL_ROLES.DOCTOR,
  };

  return roleMap[lowerRole] || role;
};

const parseStoredAuth = () => {
  const parsed = getStoredAuthState();
  if (!parsed) {
    return { 
      user: null, 
      role: null,
      username: null,
      phone: null,
      tenantType: null,
      organizationId: null,
      organizationName: null,
      divisionId: null,
      divisionName: null,
      branchId: null,
      branchName: null,
      status: null,
    };
  }

  return {
    user: parsed?.user || null,
    role: normalizeRole(parsed?.role) || null,
    username: parsed?.user?.username || parsed?.username || null,
    phone: parsed?.user?.phone || parsed?.phone || null,
    tenantType: parsed?.tenantType || null,
    organizationId: parsed?.organizationId || null,
    organizationName: parsed?.organizationName || null,
    divisionId: parsed?.divisionId || null,
    divisionName: parsed?.divisionName || null,
    branchId: parsed?.branchId || null,
    branchName: parsed?.branchName || null,
    status: parsed?.status || null,
  };
};

const AuthContext = createContext({
  user: null,
  role: null,
  username: null,
  phone: null,
  tenantType: null,
  organizationId: null,
  organizationName: null,
  divisionId: null,
  divisionName: null,
  branchId: null,
  branchName: null,
  status: null,
  isAuthenticated: false,
  hasRole: () => false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(parseStoredAuth);

  useEffect(() => {
    // Only run if user is logged in
    if (!authState.user) return;

    // Send immediately on mount
    sendHeartbeatApi();

    // Then send every 2 minutes
    const intervalId = setInterval(() => {
      sendHeartbeatApi();
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [authState.user]);

  const updateAuthUser = (updatedData = {}) => {
    setAuthState((prevState) => {
      const nextUser = {
        ...(prevState.user || {}),
        ...updatedData,
      };

      const nextState = {
        ...prevState,
        user: nextUser,
        username: updatedData.username ?? nextUser.username ?? prevState.username ?? null,
        phone: updatedData.phone ?? nextUser.phone ?? prevState.phone ?? null,
      };

      saveAuthState(nextState);
      return nextState;
    });
  };

  const login = ({
    id = null,
    email,
    name = null,
    username = null,
    phone = null,
    role,
    tenantType = null,
    organizationId = null,
    organizationName = null,
    divisionId = null,
    divisionName = null,
    branchId = null,
    branchName = null,
    status = null,
  }) => {
    const user = {
      id: id || Date.now().toString(),
      email,
      name: name || (email || "User").split("@")[0] || "User",
      username: username || null,
      phone: phone || null,
    };

    // Persist the shared org-admin scope alongside the role so future backend auth can isolate tenant data.
    const nextState = {
      user,
      role: normalizeRole(role),
      username: username || null,
      phone: phone || null,
      tenantType,
      organizationId,
      organizationName,
      divisionId,
      divisionName,
      branchId,
      branchName,
      status,
    };
    saveAuthState(nextState);
    setAuthState(nextState);
  };

  const logout = async () => {
    await logoutUserApi();
    clearAuthState();
    setAuthState({ 
      user: null, role: null, username: null, phone: null, tenantType: null, organizationId: null, organizationName: null, divisionId: null, divisionName: null, branchId: null, branchName: null, status: null,
    });
  };

  const value = useMemo(
    () => {
      const isAuthenticated = Boolean(authState.user && authState.role);
      const hasRole = (requiredRole) => authState.role === normalizeRole(requiredRole);

      return {
        user: authState.user,
        role: authState.role,
        username: authState.username,
        phone: authState.phone,
        tenantType: authState.tenantType,
        organizationId: authState.organizationId,
        organizationName: authState.organizationName,
        divisionId: authState.divisionId,
        divisionName: authState.divisionName,
        branchId: authState.branchId,
        branchName: authState.branchName,
        status: authState.status,
        isAuthenticated,
        hasRole,
        login,
        logout,
        updateAuthUser,
      };
    },
    [
      authState.user,
      authState.role,
      authState.username,
      authState.phone,
      authState.tenantType,
      authState.organizationId,
      authState.organizationName,
      authState.divisionId,
      authState.divisionName,
      authState.branchId,
      authState.branchName,
      authState.status,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
