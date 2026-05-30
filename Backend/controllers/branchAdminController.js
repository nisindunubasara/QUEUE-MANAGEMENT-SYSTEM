import Branch from "../models/Branch.js";
import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import Token from "../models/Token.js";
import User from "../models/User.js";

/**
 * Branch-admin scoped dashboard counts.
 * Scope is derived from req.user and cannot be overridden by client input.
 */
export const getBranchAdminCounts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (req.user.role !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch admins can access branch dashboard counts",
      });
    }

    const branchId = req.user.branchId;
    if (!branchId) {
      return res.status(403).json({
        success: false,
        message: "Logged-in user does not have a branchId",
      });
    }

    const branchScopeFilter = {
      _id: branchId,
      tenantType: req.user.tenantType || undefined,
      organizationId: req.user.organizationId || undefined,
      divisionId: req.user.divisionId || undefined,
    };

    // Remove undefined keys from filter object.
    Object.keys(branchScopeFilter).forEach((key) => {
      if (branchScopeFilter[key] === undefined) {
        delete branchScopeFilter[key];
      }
    });

    const branch = await Branch.findOne(branchScopeFilter).lean();
    if (!branch) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this branch",
      });
    }

    const staffCount = await User.countDocuments({
      branchId,
      role: { $in: ["staff", "police_staff"] },
    });

    const tokenFilter = {
      tenantType: req.user.tenantType || branch.tenantType,
      branch: branch.branchName,
    };

    if (req.user.organizationName) {
      tokenFilter.organization = req.user.organizationName;
    }

    const tokensCount = await Token.countDocuments(tokenFilter);
    const operationsCount = await Token.countDocuments({
      ...tokenFilter,
      status: { $ne: "Waiting" },
    });
    const tasksCount = await Token.countDocuments({
      ...tokenFilter,
      status: "Waiting",
    });

    return res.status(200).json({
      success: true,
      counts: {
        staff: staffCount,
        tokens: tokensCount,
        operations: operationsCount,
        tasks: tasksCount,
      },
    });
  } catch (error) {
    console.error("getBranchAdminCounts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching branch admin counts",
    });
  }
};

export const updateBranchOperatingHours = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }

    if (String(req.user.role || "").trim().toLowerCase() !== "branch_admin") {
      return res.status(403).json({ success: false, message: "Only branch admins can update operating hours" });
    }

    const branchId = req.user.branchId;
    if (!branchId) {
      return res.status(400).json({ success: false, message: "Logged-in user does not have a branchId" });
    }

    const inputOperating = req.body?.operatingHours;
    if (!Array.isArray(inputOperating)) {
      return res.status(400).json({ success: false, message: "operatingHours must be an array" });
    }

    const normalized = [];
    for (const item of inputOperating) {
      const date = String(item?.date || "").trim();
      const openTime = String(item?.openTime ?? "").trim();
      const closeTime = String(item?.closeTime ?? "").trim();

      if (!date) {
        return res.status(400).json({ success: false, message: "Each operatingHours item must include a date" });
      }

      normalized.push({ date, openTime, closeTime });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const existing = Array.isArray(branch.operatingHours) ? branch.operatingHours : [];

    // Merge incoming entries into existing by date
    for (const incoming of normalized) {
      const found = existing.find((e) => String(e?.date || "") === String(incoming.date));
      if (found) {
        found.openTime = incoming.openTime;
        found.closeTime = incoming.closeTime;
      } else {
        existing.push({ date: incoming.date, openTime: incoming.openTime, closeTime: incoming.closeTime });
      }
    }

    // Remove past dates (keep entries with date >= today)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const filtered = (existing || []).filter((entry) => {
      const entryDate = String(entry?.date || "").trim();
      return !entryDate || entryDate >= today;
    });

    branch.operatingHours = filtered;
    await branch.save();

    return res.status(200).json({ success: true, message: "Operating hours updated successfully", data: { operatingHours: branch.operatingHours || [] } });
  } catch (error) {
    console.error("updateBranchOperatingHours error:", error);
    return res.status(500).json({ success: false, message: "Server error while updating operating hours" });
  }
};

export const getBranchAdminOperations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const requesterRole = String(req.user.role || "").trim().toLowerCase();
    if (requesterRole !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch_admin can access branch operations",
      });
    }

    const branchId = req.user.branchId || null;
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Logged-in user does not have a branchId",
      });
    }

    const branch = await Branch.findById(branchId).select("_id branchName services maxDailyTokens").lean();
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const serviceTokenMap = new Map(
      (branch.services || [])
        .filter((service) => service?.serviceId)
        .map((service) => [String(service.serviceId), Number(service.maxDailyTokens) || 0])
    );

    const [services, counters, staffUsers] = await Promise.all([
      Service.find({ branchIds: { $in: [branchId] } })
        .select("_id serviceName status")
        .sort({ createdAt: -1 })
        .lean(),
      Counter.find({ branchId })
        .select("_id serviceId counterName status assignedStaffId")
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: { $in: ["staff", "doctor"] }, branchId })
        .select("_id name email role status")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const staffById = new Map(staffUsers.map((staff) => [String(staff._id), staff]));

    const countersByServiceId = new Map();
    const assignedStaffIds = new Set();

    for (const counter of counters) {
      if (!counter.serviceId) {
        continue;
      }

      const serviceKey = String(counter.serviceId);
      if (!countersByServiceId.has(serviceKey)) {
        countersByServiceId.set(serviceKey, []);
      }

      const assignedStaff = counter.assignedStaffId
        ? staffById.get(String(counter.assignedStaffId)) || null
        : null;

      if (assignedStaff) {
        assignedStaffIds.add(String(assignedStaff._id));
      }

      countersByServiceId.get(serviceKey).push({
        counterId: counter._id,
        counterName: counter.counterName,
        status: counter.status,
        assignedStaff: assignedStaff
          ? {
              id: assignedStaff._id,
              name: assignedStaff.name,
              email: assignedStaff.email,
              role: assignedStaff.role,
              status: assignedStaff.status,
            }
          : null,
      });
    }

    const servicesResponse = services.map((service) => {
      const serviceCounters = countersByServiceId.get(String(service._id)) || [];
      const branchServiceEntry = (branch.services || []).find(
        (entry) => String(entry?.serviceId || "") === String(service._id) || String(entry?._id || "") === String(service._id)
      );

      return {
        serviceId: service._id,
        serviceName: service.serviceName,
        status: branchServiceEntry?.status || service.status || "inactive",
        maxDailyTokens: serviceTokenMap.get(String(service._id)) || 0,
        dailyLimits: branchServiceEntry ? branchServiceEntry.dailyLimits : [],
        averageTokenTime: branchServiceEntry?.averageTokenTime || 15,
        counters: serviceCounters,
        activeCounterCount: serviceCounters.filter((counter) => counter.status === "active").length,
        inactiveCounterCount: serviceCounters.filter((counter) => counter.status !== "active").length,
      };
    });

    const unassignedCounters = counters
    .filter((counter) => !counter.serviceId)
    .map((counter) => ({
      counterId: counter._id,
      counterName: counter.counterName,
      status: counter.status,
    }));

    const activeStaff = staffUsers
      .filter((staff) => String(staff.status || "").toLowerCase() === "active")
      .map((staff) => ({
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      }));

    const inactiveStaff = staffUsers
      .filter((staff) => String(staff.status || "").toLowerCase() !== "active")
      .map((staff) => ({
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      }));

    const unassignedStaff = staffUsers
      .filter((staff) => !assignedStaffIds.has(String(staff._id)))
      .map((staff) => ({
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      }));

    return res.status(200).json({
      branch: {
        branchId: branch._id,
        branchName: branch.branchName,
        maxDailyTokens: branch.maxDailyTokens || 0,
      },
      services: servicesResponse,
      unassignedCounters: unassignedCounters,
      staffSummary: {
        activeStaff,
        inactiveStaff,
        unassignedStaff,
      },
    });
  } catch (error) {
    console.error("getBranchAdminOperations error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching branch operations",
    });
  }
};

export const updateBranchServiceTokenLimit = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (String(req.user.role || "").trim().toLowerCase() !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch admins can update branch service token limits",
      });
    }

    const { serviceId } = req.params;
    const maxDailyTokens = Number(req.body?.maxDailyTokens) || 0;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    const branch = await Branch.findById(req.user.branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const services = Array.isArray(branch.services) ? branch.services : [];
    branch.services = services;

    const branchLimit = Number(branch.maxDailyTokens) || 0;
    const totalAllocatedForOtherServices = services
      .filter((service) => String(service?.serviceId || "") !== String(serviceId))
      .reduce((sum, service) => sum + (Number(service?.maxDailyTokens) || 0), 0);
    const newTotal = totalAllocatedForOtherServices + maxDailyTokens;

    if (branchLimit > 0 && newTotal > branchLimit) {
      const remainingTokens = Math.max(0, branchLimit - totalAllocatedForOtherServices);
      return res.status(400).json({
        success: false,
        message: `Cannot allocate tokens. Exceeds the branch total daily limit of ${branchLimit}. You have ${remainingTokens} remaining.`,
      });
    }

    const existingService = services.find(
      (service) => String(service?.serviceId || "") === String(serviceId)
    );

    if (existingService) {
      existingService.maxDailyTokens = maxDailyTokens;
    } else {
      branch.services.push({
        serviceId,
        maxDailyTokens,
      });
    }

    await branch.save();

    return res.status(200).json({
      success: true,
      message: "Branch service token limit updated successfully",
      data: {
        serviceId,
        maxDailyTokens,
      },
    });
  } catch (error) {
    console.error("updateBranchServiceTokenLimit error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating branch service token limit",
    });
  }
};


export const updateBranchServiceStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (String(req.user.role || "").trim().toLowerCase() !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch admins can update branch service status",
      });
    }

    const branchId = req.user.branchId;
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Logged-in user does not have a branchId",
      });
    }

    const { serviceId } = req.params;
    const status = String(req.body?.status || "").trim().toLowerCase();

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be either active or inactive",
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const services = Array.isArray(branch.services) ? branch.services : [];
    let service = services.find(
      (entry) => String(entry?.serviceId || "") === String(serviceId) || String(entry?._id || "") === String(serviceId)
    );

    if (!service) {
      // Auto-heal: Check if the service actually exists in the main Service collection and is linked to this branch
      const actualService = await Service.findOne({ _id: serviceId, branchIds: branchId });
      
      if (!actualService) {
        return res.status(404).json({
          success: false,
          message: "Service is not configured for this branch",
        });
      }

      // Auto-add the missing service configuration to the branch document
      service = {
        serviceId: actualService._id,
        status: status,
        maxDailyTokens: 0,
        averageTokenTime: 15,
        dailyLimits: []
      };
      branch.services.push(service);
    } else {
      service.status = status;
    }
    branch.services = services;
    await branch.save();

    return res.status(200).json({
      success: true,
      message: "Branch service status updated successfully",
      data: {
        serviceId,
        status: service.status,
      },
    });
  } catch (error) {
    console.error("updateBranchServiceStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating branch service status",
    });
  }
};

export const updateServiceAverageTime = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (String(req.user.role || "").trim().toLowerCase() !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch admins can update service average time",
      });
    }

    const branchId = req.user.branchId;
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Logged-in user does not have a branchId",
      });
    }

    const { serviceId } = req.params;
    const averageTokenTime = Number(req.body?.averageTokenTime);

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    if (!Number.isFinite(averageTokenTime) || averageTokenTime <= 0) {
      return res.status(400).json({
        success: false,
        message: "averageTokenTime must be a valid number greater than 0",
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const services = Array.isArray(branch.services) ? branch.services : [];
    branch.services = services;

    const service = services.find(
      (entry) => String(entry?.serviceId || "") === String(serviceId)
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service is not configured for this branch",
      });
    }

    service.averageTokenTime = averageTokenTime;
    await branch.save();

    return res.status(200).json({
      success: true,
      message: "Service average token time updated successfully",
      data: {
        serviceId,
        averageTokenTime,
      },
    });
  } catch (error) {
    console.error("updateServiceAverageTime error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating service average token time",
    });
  }
};

export const updateBranchServiceDailyLimits = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (String(req.user.role || "").trim().toLowerCase() !== "branch_admin") {
      return res.status(403).json({
        success: false,
        message: "Only branch admins can update branch service daily limits",
      });
    }

    const { serviceId } = req.params;
    const branchId = req.user.branchId;
    const inputDailyLimits = req.body?.dailyLimits;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Logged-in user does not have a branchId",
      });
    }

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    if (!Array.isArray(inputDailyLimits)) {
      return res.status(400).json({
        success: false,
        message: "dailyLimits must be an array",
      });
    }

    const normalizedDailyLimits = [];
    for (const item of inputDailyLimits) {
      const date = String(item?.date || "").trim();
      const limit = Number(item?.limit);

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Each dailyLimits item must include a date",
        });
      }

      if (!Number.isFinite(limit) || limit < 0) {
        return res.status(400).json({
          success: false,
          message: "Each dailyLimits item must include a valid non-negative limit",
        });
      }

      normalizedDailyLimits.push({
        date,
        limit,
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const services = Array.isArray(branch.services) ? branch.services : [];
    branch.services = services;

    const service = services.find(
      (entry) => String(entry?.serviceId || "") === String(serviceId)
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service is not configured for this branch",
      });
    }

    const existingDailyLimits = Array.isArray(service.dailyLimits) ? service.dailyLimits : [];

    for (const incomingLimit of normalizedDailyLimits) {
      const existingLimit = existingDailyLimits.find(
        (entry) => String(entry?.date || "") === String(incomingLimit.date || "")
      );

      if (existingLimit) {
        existingLimit.limit = incomingLimit.limit;
      } else {
        existingDailyLimits.push({
          date: incomingLimit.date,
          limit: incomingLimit.limit,
        });
      }
    }

    service.dailyLimits = existingDailyLimits;
    await branch.save();

    return res.status(200).json({
      success: true,
      message: "Branch service daily limits updated successfully",
      data: {
        serviceId,
        dailyLimits: service.dailyLimits || [],
      },
    });
  } catch (error) {
    console.error("updateBranchServiceDailyLimits error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating branch service daily limits",
    });
  }
};
