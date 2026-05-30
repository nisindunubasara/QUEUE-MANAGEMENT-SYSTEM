import cron from "node-cron";
import Branch from "../models/Branch.js";

const getTodayDateString = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export const startDailyLimitCleanup = () => {
	console.log("Daily limit cleanup cron scheduled.");

	cron.schedule("0 0 * * *", async () => {
		console.log("Daily limit cleanup started.");

		try {
			const today = getTodayDateString();
			const branches = await Branch.find({});

			for (const branch of branches) {
				let branchModified = false;
				const services = Array.isArray(branch.services) ? branch.services : [];

				for (const service of services) {
					const dailyLimits = Array.isArray(service.dailyLimits) ? service.dailyLimits : [];
					const filteredDailyLimits = dailyLimits.filter((entry) => {
						const entryDate = String(entry?.date || "").trim();
						return !entryDate || entryDate >= today;
					});

					if (filteredDailyLimits.length !== dailyLimits.length) {
						service.dailyLimits = filteredDailyLimits;
						branchModified = true;
					}
				}

				if (branchModified) {
					branch.services = services;
					await branch.save();
				}
			}

			console.log("Daily limit cleanup completed successfully.");
		} catch (error) {
			console.error("Daily limit cleanup error:", error);
		}
	});
};
