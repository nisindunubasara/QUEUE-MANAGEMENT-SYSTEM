const normalizeWords = (value = "") =>
  String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const firstLetter = (value = "", fallback = "X") => {
  const word = normalizeWords(value)[0];
  return (word?.charAt(0) || fallback).toUpperCase();
};

export const getTenantCode = (tenantType = "") => {
  const map = {
    bank: "B",
    hospital: "H",
    police: "P",
    supermarket: "S",
  };

  return map[String(tenantType).trim().toLowerCase()] || firstLetter(tenantType, "X");
};

export const getOrganizationCode = (organization = "") => firstLetter(organization, "X");

export const getBranchCode = (city = "") => firstLetter(city, "X");

export const getServiceCode = (service = "") => {
  const words = normalizeWords(service);

  if (words.length === 0) {
    return "X";
  }

  return words[0].charAt(0).toUpperCase();
};

export const getServiceIdCode = (serviceId) => {
  try {
    // Handle both MongoDB ObjectId and string
    const idString = String(serviceId || "");
    const firstChar = idString.charAt(0);
    return (firstChar || "X").toUpperCase();
  } catch (error) {
    return "X";
  }
};

export const buildTokenPrefix = ({ tenantType, organization, city, service, serviceId, bookingDate }) => {
  const basePrefix = `${getTenantCode(tenantType)}${getOrganizationCode(organization)}${getBranchCode(city)}${getServiceCode(service)}${getServiceIdCode(serviceId)}`;

  if (!bookingDate) {
    return basePrefix;
  }

  const dateParts = String(bookingDate).trim().split("-");
  if (dateParts.length !== 3) {
    return basePrefix;
  }

  const [year, month, day] = dateParts;
  const suffix = `${String(year).slice(-2)}${String(month).padStart(2, "0")} ${String(day).padStart(2, "0")}`.replace(/\s+/g, "");

  return `${basePrefix}-${suffix}`;
};

export const formatSequenceNumber = (sequenceNumber) => String(sequenceNumber).padStart(5, "0");
