import api from "./api";

export const getCurrentStaffTask = async () => {
  try {
    const response = await api.get("/work-sessions/current");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching current staff task" };
  }
};

export const getStaffBranchServices = async () => {
  try {
    const response = await api.get("/work-sessions/services");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching branch services" };
  }
};

export const getStaffBranchCounters = async () => {
  try {
    const response = await api.get("/work-sessions/counters");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching branch counters" };
  }
};

export const startStaffTask = async (payload) => {
  try {
    const response = await api.post("/work-sessions/start", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error starting staff task" };
  }
};

export const endStaffTask = async () => {
  try {
    const response = await api.patch("/work-sessions/end");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error ending staff task" };
  }
};

// Smart Routing සඳහා අලුත් API calls
export const callNextToken = async (counterId) => {
  try {
    const response = await api.post("/tokens/call-next", { counterId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error calling next token" };
  }
};

export const skipAndCallNextToken = async (counterId) => {
  try {
    const response = await api.post("/tokens/skip-and-call-next", { counterId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error skipping current token" };
  }
};

<<<<<<< HEAD
=======
export const skipAndPushBackToken = async (tokenId) => {
  try {
    const response = await api.post("/tokens/skip-and-push-back", { tokenId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error temporarily skipping token" };
  }
};

export const reactivateToken = async (tokenId) => {
  try {
    const response = await api.post("/tokens/reactivate-token", { tokenId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error reactivating token" };
  }
};

export const getWaitingQueueTokens = async (params) => {
  try {
    const response = await api.get("/tokens/waiting-queue", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching waiting queue" };
  }
};

export const getTemporarilySkippedTokens = async (params) => {
  try {
    const response = await api.get("/tokens/temporarily-skipped", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching temporarily skipped tokens" };
  }
};

>>>>>>> main
// පෝලිමේ ඉන්න ගණන බලාගන්න (මේකට backend එකේ endpoint එකක් පසුව හදමු, දැනට fetchTokens පාවිච්චි කළ හැකියි)
export const getWaitingTokenCount = async (params) => {
  try {
    const response = await api.get("/tokens/waiting-count", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching waiting count" };
  }
};

export const getNextWaitingToken = async (serviceId, branchId) => {
  try {
    const response = await api.get("/tokens/next-waiting", {
      params: { serviceId, branchId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching next token" };
  }
};

export const getProcessedTokens = async (counterId, limit = 20) => {
  try {
    const response = await api.get("/tokens/processed-history", {
      params: { counterId, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error fetching processed tokens" };
  }
<<<<<<< HEAD
=======
};

export const cancelToken = async (tokenId) => {
  try {
    const response = await api.patch(`/tokens/${tokenId}/status`, { status: "Cancelled" });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error cancelling token" };
  }
>>>>>>> main
};