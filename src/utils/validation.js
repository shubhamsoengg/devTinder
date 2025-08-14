const validator = require("validator");

const validateSignUpData = (req) => {
	const { firstName, lastName, email, password } = req.body;
	if (!firstName || !lastName || !email || !password) {
		throw new Error("All fields are required");
	}
	if (firstName.length < 2 || firstName.length > 50) {
		throw new Error("First name must be between 2 and 50 characters");
	}
	if (validator.isEmail(email) === false) {
		throw new Error("Email is invalid");
	}
	if (!validator.isStrongPassword(password)) {
		throw new Error("Pasword must be a strong password.");
	}
};
module.exports = { validateSignUpData };
