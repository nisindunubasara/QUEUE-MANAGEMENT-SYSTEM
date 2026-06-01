import PlaceholderPage from "../../components/common/PlaceholderPage";
import { useAuth } from "../../context/AuthContext";

export default function SharedSuperAdminReports() {
  const { tenantType } = useAuth();
  const tenantLabel = tenantType
    ? tenantType.charAt(0).toUpperCase() + tenantType.slice(1)
    : "Network";

  return (
    <PlaceholderPage
      title={`${tenantLabel} Reports`}
      subtitle={`View analytics and reports for your ${tenantType || "network"}`}
      message={`${tenantLabel} reports coming soon`}
    />
  );
}
