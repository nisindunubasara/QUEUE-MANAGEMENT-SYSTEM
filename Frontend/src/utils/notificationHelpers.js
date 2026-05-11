const tenantNotificationModules = {
  bank: "bank",
  police: "police",
  supermarket: "supermarket",
  hospital: "hospital",
};

export const filterNotificationsByTenantAndModule = ({
  notifications,
  tenantType,
}) => {
  const tenantModule = tenantNotificationModules[tenantType];

  if (tenantModule) {
    return notifications.filter((item) => item.module === tenantModule);
  }

  return notifications;
};