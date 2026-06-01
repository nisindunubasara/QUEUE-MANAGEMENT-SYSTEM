import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganizationByTenant } from "../../services/tenantService";

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
  "Western", "Central", "Southern", "Northern", "Eastern", 
  "North Western", "North Central", "Uva", "Sabaragamuwa"
];

const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle"
];

const initialFormState = {
  hospitalName: "",
  shortName: "",
  hospitalCategory: hospitalCategories[0],
  province: provinces[0],
  district: districts[0],
  city: "",
  address: "",
  contactNumber: "",
  email: "",
  status: "active",
  admin: {
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  },
};

export default function AddMainHospital() {
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
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Create Payload without Branch and Services
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
          tokenPrefix: "",
          maxDailyTokens: 0,
          priorityEnabled: false,
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
        navigate("/hospital-super-admin/registered-hospitals", { 
          state: { successMessage: "Hospital Organization and Admin created successfully!" } 
        });
      } else {
        setError(response?.message || "Failed to register hospital. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while registering the hospital.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Add District</h1>
        <p className="mt-2 text-gray-600">Register a new district and create an admin account.</p>

        {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* District Details Section */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">District Information</h2>
            
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">District Name</label>
                <input name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="MATARA DISTRICT" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Short Name</label>
                <input name="shortName" value={formData.shortName} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="Ex: NHC" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Main Hospital Category</label>
                <select name="hospitalCategory" value={formData.hospitalCategory} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100">
                  {hospitalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <select name="province" value={formData.province} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100">
                  {provinces.map(p => <option key={p} value={p}>{p} Province</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">District</label>
                <select name="district" value={formData.district} onChange={handleInputChange} className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <input name="city" value={formData.city} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="Colombo 07" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Main Hospital Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="No. 24, Main Road" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="+94..." />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Hospital Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" placeholder="info@hospital.com" />
              </div>
            </div>
          </section>

          {/* Admin Section */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Admin Access</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Name</label>
                <input name="name" value={formData.admin.name} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Email</label>
                <input name="email" type="email" value={formData.admin.email} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Phone</label>
                <input name="phone" value={formData.admin.phone} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input name="username" value={formData.admin.username} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" value={formData.admin.password} onChange={handleAdminChange} required className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-sky-100" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-gray-400">
              {submitting ? "Saving..." : "Register Hospital & Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}