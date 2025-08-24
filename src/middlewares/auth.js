const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendResponse = require("../utils/sendResponse");

const userAuthentication = async (req, res, next) => {
	try {
		const { token } = req.cookies;
		if (!token) {
			return sendResponse(
				res,
				401,
				false,
				null,
				"Unauthorized: Please login!",
				[{ field: "auth", message: "Missing token" }]
			);
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const { _id } = decoded;
		const user = await User.findById(_id);
		if (!user) {
			return sendResponse(res, 404, false, null, "User not found", [
				{ field: "user", message: "No user with this token" },
			]);
		}
		req.user = user;
		next();
	} catch (error) {
		return sendResponse(
			res,
			401,
			false,
			null,
			"Unauthorized: Invalid token",
			[{ field: "auth", message: error.message }]
		);
	}
};

module.exports = { userAuthentication };
