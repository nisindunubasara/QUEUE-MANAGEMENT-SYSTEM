// src/config/tenantTextConfig.js

export const TENANT_TEXT = {
  bank: {
    organizations: {
      pageTitle: "Organizations",
      pageSubtitle: "Manage and view all registered organizations",
      addLabel: "Add Bank",
      tableTitle: "Registered Networks",
    },
    branches: {
      pageTitle: "Branch Management",
      pageSubtitle: "Manage and view all branches for your network",
      tableTitle: "Bank Branches",
    }
  },
  hospital: {
    organizations: {
      pageTitle: "Districts",
      pageSubtitle: "Manage and view all registered districts",
      addLabel: "Add District",
      tableTitle: "Registered Districts",
    },
    branches: {
      pageTitle: "Hospital Management",
      pageSubtitle: "Manage and view all hospitals in the district",
      tableTitle: "Hospital Branches",
    }
  },
  police: {
    organizations: {
      pageTitle: "Police Divisions",
      pageSubtitle: "Manage and view all registered divisions",
      addLabel: "Add Division",
      tableTitle: "Registered Networks",
    },
    branches: {
      pageTitle: "Police Stations",
      pageSubtitle: "Manage and view all police stations in the division",
      tableTitle: "Police Stations",
    }
  },
};