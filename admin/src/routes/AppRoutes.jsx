import { Navigate, Route, Routes } from "react-router-dom";
import { CANONICAL_ROLES, useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/auth/Login";
import NotFound from "../pages/shared/NotFound";

// Police Super Admin
import PoliceSuperAdminDashboard from "../pages/policeSuperAdmin/Dashboard";
import PoliceSuperAdminMainDivision from "../pages/policeSuperAdmin/MainDivision";
import PoliceSuperAdminAddMainDivision from "../pages/policeSuperAdmin/AddMainDivision";
import PoliceSuperAdminServices from "../pages/policeSuperAdmin/Services";
import PoliceSuperAdminAddService from "../pages/policeSuperAdmin/AddService";
import PoliceSuperAdminBranches from "../pages/policeSuperAdmin/Branches";
import PoliceSuperAdminAddBranch from "../pages/policeSuperAdmin/AddBranch";
import PoliceSuperAdminBranchAdmins from "../pages/policeSuperAdmin/BranchAdmins";
import PoliceSuperAdminBranchRequests from "../pages/policeSuperAdmin/PoliceSuperAdminBranchRequests";
import PoliceSuperAdminReports from "../pages/policeSuperAdmin/Reports";

// Hospital Super Admin
import HospitalSuperAdminDashboard from "../pages/hospitalSuperAdmin/Dashboard";
import HospitalSuperAdminHospitals from "../pages/hospitalSuperAdmin/Hospitals";
import HospitalSuperAdminAddMainCategory from "../pages/hospitalSuperAdmin/AddMainCategory";
import HospitalSuperAdminServices from "../pages/hospitalSuperAdmin/Services";
import HospitalSuperAdminAddService from "../pages/hospitalSuperAdmin/AddService";
import HospitalSuperAdminRegisteredHospitals from "../pages/hospitalSuperAdmin/RegisteredHospitals";
import HospitalSuperAdminAddHospital from "../pages/hospitalSuperAdmin/AddHospital";
import HospitalSuperAdminHospitalAdmins from "../pages/hospitalSuperAdmin/HospitalAdmins";
import HospitalSuperAdminBranchRequests from "../pages/hospitalSuperAdmin/BranchRequests";
import HospitalSuperAdminReports from "../pages/hospitalSuperAdmin/Reports";

// Bank Super Admin
import BankSuperAdminDashboard from "../pages/bankSuperAdmin/Dashboard";
import BankSuperAdminOrganizations from "../pages/bankSuperAdmin/Organizations";
import BankSuperAdminBranches from "../pages/bankSuperAdmin/Branches";
import BankSuperAdminAddBank from "../pages/bankSuperAdmin/AddBank";
import BankSuperAdminAddBankBranch from "../pages/bankSuperAdmin/AddBankBranch";
import BankSuperAdminOrganizationAdmins from "../pages/bankSuperAdmin/OrganizationAdmins";
import BankSuperAdminReports from "../pages/bankSuperAdmin/Reports";
import BankSuperAdminBranchRequests from "../pages/bankSuperAdmin/BranchRequests";

// Shared Organization Admin
import SharedOrganizationAdminDashboard from "../pages/organizationAdmin/Dashboard";
import SharedOrganizationAdminBranches from "../pages/organizationAdmin/Branches";
import AddBranch from "../pages/organizationAdmin/AddBranch";
import AddService from "../pages/organizationAdmin/AddService";
import SharedOrganizationAdminBranchAdmins from "../pages/organizationAdmin/BranchAdmins";
import SharedOrganizationAdminServices from "../pages/organizationAdmin/Services";
import SharedOrganizationAdminReports from "../pages/organizationAdmin/Reports";
import OrganizationAdminSettings from "../pages/organizationAdmin/Settings";

// Branch Admin
import BranchAdminDashboard from "../pages/branchAdmin/Dashboard";
import BranchAdminStaff from "../pages/branchAdmin/Staff";
import BranchAdminAddStaff from "../pages/branchAdmin/AddStaff";
import BranchAdminAddDoctor from "../pages/branchAdmin/AddDoctor";
import BranchAdminOperations from "../pages/branchAdmin/Operations";
import BranchAdminDetails from "../pages/branchAdmin/BranchDetails";
import BranchAdminSettings from "../pages/branchAdmin/Settings";

// Staff
import StaffDashboard from "../pages/staff/Dashboard";
import StaffProfile from "../pages/staff/Profile";
import StaffTasks from "../pages/staff/Tasks";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";

import { getDefaultDashboardPath } from "../utils/permissions";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultDashboardPath(role)} replace />} />
      <Route path="/login" element={<Login loginType="default" />} />
      <Route path="/police-login" element={<Login loginType="police_super_admin" />} />
      <Route path="/hospital-login" element={<Login loginType="hospital_super_admin" />} />
      <Route path="/bank-login" element={<Login loginType="bank_super_admin" />} />
      <Route path="/admin-login" element={<Login loginType="organization_admin" />} />
      <Route path="/branch-login" element={<Login loginType="branch_admin" />} />
      <Route path="/staff-login" element={<Login loginType="staff" />} />
      <Route path="/doctor-login" element={<Login loginType="doctor" />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* POLICE SUPER ADMIN ROUTES */}
        <Route
          path="/police-super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/main-division"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminMainDivision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/add-main-division"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminAddMainDivision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/branches"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminBranches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/add-branch"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminAddBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/services"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/add-service"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminAddService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/branch-admins"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminBranchAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/branch-requests"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminBranchRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-super-admin/reports"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.POLICE_SUPER_ADMIN]}>
              <PoliceSuperAdminReports />
            </ProtectedRoute>
          }
        />

        {/* HOSPITAL SUPER ADMIN ROUTES */}
        <Route
          path="/hospital-super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/hospitals"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminHospitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/add-category"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminAddMainCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/services"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/add-service"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminAddService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/registered-hospitals"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminRegisteredHospitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/add-hospital"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminAddHospital />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/hospital-admins"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminHospitalAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/branch-requests"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminBranchRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-super-admin/reports"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]}>
              <HospitalSuperAdminReports />
            </ProtectedRoute>
          }
        />

        {/* BANK SUPER ADMIN ROUTES */}
        <Route
          path="/bank-super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/organizations"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminOrganizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/branches"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminBranches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/add-bank"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminAddBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/add-bank-branch"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminAddBankBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/organization-admins"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminOrganizationAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/branch-requests"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminBranchRequests/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-super-admin/reports"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BANK_SUPER_ADMIN]}>
              <BankSuperAdminReports />
            </ProtectedRoute>
          }
        />

        {/* ORGANIZATION ADMIN ROUTES */}
        <Route
          path="/organization-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <SharedOrganizationAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/branches"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <SharedOrganizationAdminBranches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/add-branch"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <AddBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/branch-admins"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <SharedOrganizationAdminBranchAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/services"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <SharedOrganizationAdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/add-service"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <AddService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/reports"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <SharedOrganizationAdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-admin/settings"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.ORGANIZATION_ADMIN]}>
              <OrganizationAdminSettings />
            </ProtectedRoute>
          }
        />

        {/* BRANCH ADMIN ROUTES */}
        <Route
          path="/branch-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branch-admin/staff"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branch-admin/add-staff"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminAddStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branch-admin/add-doctor"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminAddDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branch-admin/operations"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminOperations />
            </ProtectedRoute>
          }
        />
          <Route
            path="/branch-admin/settings"
            element={
              <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
                <BranchAdminSettings />
              </ProtectedRoute>
            }
          />
        <Route
          path="/branch-admin/branch-details"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.BRANCH_ADMIN]}>
              <BranchAdminDetails />
            </ProtectedRoute>
          }
        />

        {/* STAFF ROUTES */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.STAFF]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.STAFF]}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tasks"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.STAFF]}>
              <StaffTasks />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR ROUTES */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.DOCTOR]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={[CANONICAL_ROLES.DOCTOR]}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />

        
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
