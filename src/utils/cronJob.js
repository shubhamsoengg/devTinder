const cron = require("node-cron");

cron.schedule("0 0 * * *", () => {
	console.log("Running a job at midnight every day");
	// Add your scheduled task logic here
	// send reminder emails, clean up database, etc.
});
