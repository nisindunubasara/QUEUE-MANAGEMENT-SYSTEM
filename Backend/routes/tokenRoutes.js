import express from "express";
<<<<<<< HEAD
import { createToken, getToken, updateTokenStatus, trackTokenByNumber, getUserBookings, callNextToken, skipAndCallNextToken, getNextWaitingToken, getWaitingTokenCount, getProcessedTokensByCounter } from "../controllers/tokenController.js";
=======
import { createToken, getToken, updateTokenStatus, trackTokenByNumber, getUserBookings, callNextToken, skipAndCallNextToken, skipAndPushBackToken, reactivateToken, getNextWaitingToken, getWaitingTokenCount, getProcessedTokensByCounter, getWaitingQueueTokens, getTemporarilySkippedTokens } from "../controllers/tokenController.js";
>>>>>>> main

import authMiddleware from "../middlewares/authMiddleware.js";

const tokenrouter = express.Router();

// Specific routes first (must be before /:id to avoid being matched as a parameter)
tokenrouter.get("/my-bookings", authMiddleware, getUserBookings);
tokenrouter.post("/call-next", authMiddleware, callNextToken);
tokenrouter.post("/skip-and-call-next", authMiddleware, skipAndCallNextToken);
<<<<<<< HEAD
=======
tokenrouter.post("/skip-and-push-back", authMiddleware, skipAndPushBackToken);
tokenrouter.post("/reactivate-token", authMiddleware, reactivateToken);
tokenrouter.get("/waiting-queue", authMiddleware, getWaitingQueueTokens);
tokenrouter.get("/temporarily-skipped", authMiddleware, getTemporarilySkippedTokens);
>>>>>>> main
tokenrouter.get("/next-waiting", authMiddleware, getNextWaitingToken);
tokenrouter.get("/waiting-count", authMiddleware, getWaitingTokenCount);
tokenrouter.get("/processed-history", authMiddleware, getProcessedTokensByCounter);
tokenrouter.get("/track/:tokenNumber", trackTokenByNumber);

// Create, update, and generic get must be after specific routes
tokenrouter.post("/", authMiddleware, createToken);
tokenrouter.patch("/:id/status", updateTokenStatus);

// Generic routes last (most general pattern)
tokenrouter.get("/:id", getToken);

export default tokenrouter;