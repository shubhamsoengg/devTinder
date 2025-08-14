const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuthentication = async (req, res, next) => {
	try {
		const { token } = req.cookies;
		if (!token) {
			return res.status(401).send("Unauthorized: No token provided");
		}
		const decoded = jwt.verify(token, "my_test_secret");
		const { _id } = decoded;
		const user = await User.findById(_id);
		if (!user) {
			return res.status(404).send("User not found");
		}
		req.user = user;
		next();
	} catch (error) {
		return res
			.status(401)
			.send("Unauthorized: Invalid token" + error.message);
	}
};

module.exports = { userAuthentication };
