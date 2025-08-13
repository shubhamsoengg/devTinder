const adminAuthentication = (req, res, next) => {
	let token = "123abc"; // Example token
	let authorized = token === "123abc"; // Check if token matches
	if (!authorized) {
		return res.status(403).send("Forbidden: Invalid token");
	}
	console.log("Admin Authentication Successful!");
	next();
};

const userAuthentication = (req, res, next) => {
	let token = "123abc"; // Example token
	let authorized = token === "123abc"; // Check if token matches
	if (!authorized) {
		return res.status(403).send("Forbidden: Invalid token");
	}
	console.log("User Authentication Successful!");
	next();
};

module.exports = { adminAuthentication, userAuthentication };
