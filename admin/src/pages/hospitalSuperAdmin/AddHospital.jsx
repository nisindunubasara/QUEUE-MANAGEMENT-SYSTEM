import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import AdminInformationSection from "../../components/forms/sections/AdminInformationSection";
import BranchInformationSection from "../../components/forms/sections/BranchInformationSection";
import OrganizationInformationSection from "../../components/forms/sections/OrganizationInformationSection";
import QueueSettingsSection from "../../components/forms/sections/QueueSettingsSection";
import ServicesSelectionSection from "../../components/forms/sections/ServicesSelectionSection";
import { createOrganizationByTenant } from "../../services/tenantService";

=======
import { createOrganizationByTenant } from "../../services/tenantService";

// Drop-down සඳහා අවශ්‍ය දත්ත ලැයිස්තු
>>>>>>> main
const hospitalCategories = [
  "Teaching Hospital",
  "National Hospital",
  "Provincial General Hospital",
  "District General Hospital",
  "Base Hospital",
  "Divisional Hospital",
  "Specialized Hospital",
];

const provinces = [
<<<<<<< HEAD
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Galle",
  "Jaffna",
  "Batticaloa",
  "Kurunegala",
  "Anuradhapura",
  "Badulla",
  "Ratnapura",
];

const servicesList = [
  "OPD Consultation",
  "Radiology / Scans",
  "Laboratory Tests",
  "Dental Clinic",
  "Eye Clinic",
  "ENT Clinic",
  "Maternity Clinic",
  "Pediatric Clinic",
  "Cardiology Clinic",
];

const initialState = {
=======
  "Western", "Central", "Southern", "Northern", "Eastern", 
  "North Western", "North Central", "Uva", "Sabaragamuwa"
];

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Jaffna", 
  "Batticaloa", "Kurunegala", "Anuradhapura", "Badulla", "Ratnapura", 
  "Matara", "Trincomalee", "Hambantota", "Polonnaruwa"
];

const generateMainBranchCode = (shortName, name) => {
  const base = (shortName || name || "HOSP").trim().toUpperCase().slice(0, 4);
  return `${base}-MAIN`;
};

const initialFormState = {
>>>>>>> main
  hospitalName: "",
  shortName: "",
  hospitalCategory: hospitalCategories[0],
  province: provinces[0],
  district: districts[0],
  city: "",
  address: "",
  contactNumber: "",
  email: "",
<<<<<<< HEAD
  branchName: "",
  branchCode: "",
  openingTime: "",
  closingTime: "",
  services: [],
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  username: "",
  temporaryPassword: "",
  bookingType: "Token",
  tokenPrefix: "",
  maxDailyTokens: "",
  priorityQueueEnabled: false,
};

export default function HospitalSuperAdminAddHospital() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceToggle = (serviceName) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter((service) => service !== serviceName)
        : [...prev.services, serviceName],
=======
  status: "active",
  admin: {
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  },
};

export default function HospitalRegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      admin: { ...prev.admin, [name]: value },
>>>>>>> main
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
<<<<<<< HEAD
    setSuccessMessage("");

    try {
      const payload = {
        tenantType: "hospital",
        organizationName: form.hospitalName,
        shortName: form.shortName,
        category: form.hospitalCategory,
        province: form.province,
        district: form.district,
        city: form.city,
        address: form.address,
        contactNumber: form.contactNumber,
        email: form.email,
        queueSettings: {
          bookingType: String(form.bookingType || "Token").toLowerCase(),
          tokenPrefix: form.tokenPrefix,
          maxDailyTokens: Number(form.maxDailyTokens || 0),
          priorityEnabled: Boolean(form.priorityQueueEnabled),
        },
        status: "active",
        branch: {
          branchName: String(form.branchName || "").trim(),
          branchCode: String(form.branchCode || "").trim(),
          city: String(form.city || "").trim(),
          address: String(form.address || "").trim(),
          contactNumber: String(form.contactNumber || "").trim(),
          email: String(form.email || "").trim().toLowerCase(),
          status: "active",
        },
        services: form.services,
        admin: {
          name: String(form.adminName || "").trim(),
          email: String(form.adminEmail || "").trim().toLowerCase(),
          phone: String(form.adminPhone || "").trim(),
          username: String(form.username || "").trim(),
          password: String(form.temporaryPassword || "").trim(),
        },
      };

      const organizationResponse = await createOrganizationByTenant("hospital", payload);

      if (!organizationResponse?.success) {
        setError(organizationResponse?.message || "Failed to create hospital organization payload");
        return;
      }

      const message =
        organizationResponse?.message ||
        "Hospital, main branch, services, and organization admin created successfully";

      setSuccessMessage(message);

      navigate("/hospital-super-admin/hospital-admins", {
        state: { successMessage: message },
      });
    } catch (submitError) {
      setError(submitError?.message || "Failed to create hospital organization and admin");
=======

    try {
      const mainBranchCode = generateMainBranchCode(formData.shortName, formData.hospitalName);

      const payload = {
        tenantType: "hospital",
        organizationName: formData.hospitalName,
        shortName: formData.shortName,
        category: formData.hospitalCategory,
        province: formData.province,
        district: formData.district,
        city: formData.city,
        address: formData.address,
        contactNumber: formData.contactNumber,
        email: formData.email,
        status: formData.status,
        queueSettings: {
          bookingType: "token",
          tokenPrefix: formData.shortName.toUpperCase().slice(0, 3),
          maxDailyTokens: 0,
          priorityEnabled: false,
        },
        branch: {
          branchName: `${formData.hospitalName} Main Branch`,
          branchCode: mainBranchCode,
          city: formData.city,
          address: formData.address,
          contactNumber: formData.contactNumber,
          email: formData.email,
          status: "active",
        },
        services: [],
        admin: {
          name: formData.admin.name,
          email: formData.admin.email,
          phone: formData.admin.phone,
          username: formData.admin.username,
          password: formData.admin.password,
        },
      };

      const response = await createOrganizationByTenant("hospital", payload);

      if (response?.success) {
        navigate("/hospital-super-admin/hospital-admins", { 
          state: { successMessage: "Hospital added successfully!" } 
        });
      } else {
        setError(response?.message || "Failed to register hospital. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while registering the hospital.");
>>>>>>> main
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Registration</h1>
<<<<<<< HEAD
        <p className="mt-2 text-gray-600">Register hospital and branch admin access</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <OrganizationInformationSection
            sectionTitle="Hospital Information"
            form={form}
            onChange={handleChange}
            nameField="hospitalName"
            nameLabel="Hospital Name"
            namePlaceholder="National Hospital Colombo"
            categoryField="hospitalCategory"
            categoryLabel="Hospital Category"
            categoryOptions={hospitalCategories}
            shortNamePlaceholder="NHC"
            cityPlaceholder="Colombo"
            addressPlaceholder="No. 24, Main Road, Colombo"
            contactPlaceholder="+94 71 234 5678"
            emailPlaceholder="hospital@example.com"
            provinces={provinces}
            districts={districts}
          />

          <BranchInformationSection
            form={form}
            onChange={handleChange}
            branchNamePlaceholder="NHC West Wing"
            branchCodePlaceholder="NHC-W01"
          />

          <ServicesSelectionSection
            servicesList={servicesList}
            selectedServices={form.services}
            onToggle={handleServiceToggle}
          />

          <AdminInformationSection
            form={form}
            onChange={handleChange}
            adminNamePlaceholder="Nimal Perera"
            adminEmailPlaceholder="admin.branch@example.com"
            usernamePlaceholder="hospitalbranchadmin"
          />

          <QueueSettingsSection
            form={form}
            onChange={handleChange}
            tokenPrefixPlaceholder="NHC"
            maxDailyTokensPlaceholder="500"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/hospital-super-admin/branches")}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              {submitting ? "Saving..." : "Save Hospital"}
=======
        <p className="mt-2 text-gray-600">Enter hospital details and create an admin account.</p>

        {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Hospital Details Section */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Hospital Information</h2>
            
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Hospital Name</label>
                <input name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="National Hospital Colombo" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Short Name</label>
                <input name="shortName" value={formData.shortName} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="Ex: NHC" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select name="hospitalCategory" value={formData.hospitalCategory} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                  {hospitalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <select name="province" value={formData.province} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                  {provinces.map(p => <option key={p} value={p}>{p} Province</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">District</label>
                <select name="district" value={formData.district} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <input name="city" value={formData.city} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="Colombo 07" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="No. 24, Main Road" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="+94..." />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Hospital Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" placeholder="info@hospital.com" />
              </div>
            </div>
          </section>

          {/* Admin Section */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Admin Access</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Name</label>
                <input name="name" value={formData.admin.name} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Email</label>
                <input name="email" type="email" value={formData.admin.email} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input name="username" value={formData.admin.username} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" value={formData.admin.password} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-sky-600 text-white rounded-xl disabled:bg-gray-400">
              {submitting ? "Saving..." : "Register Hospital"}
>>>>>>> main
            </button>
          </div>
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
