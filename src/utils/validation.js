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
		throw new Error("Password must be a strong password.");
	}
};

const validateProfileEditData = (req) => {
	try {
		const allowedFields = [
			"firstName",
			"lastName",
			"gender",
			"age",
			"about",
			"skills",
			"profilePicture",
		];
		Object.keys(req.body).forEach((field) => {
			if (!allowedFields.includes(field)) {
				throw new Error(`Invalid field: ${key}`);
			}
		});
	} catch (error) {
		throw new Error("Profile edit validation failed: " + error.message);
	}
};

const validateUpdatePasswordData = async (req) => {
	const { currentPassword, newPassword, confirmNewPassword } = req.body;
	if (!currentPassword || !newPassword || !confirmNewPassword) {
		throw new Error("All password fields are required");
	}
	if (!(await req.user.validateUserPassword(currentPassword))) {
		throw new Error("Current user password is incorrect");
	}
	if (newPassword !== confirmNewPassword) {
		throw new Error("New password and confirm password do not match");
	}
	if (!validator.isStrongPassword(newPassword)) {
		throw new Error("New password must be a strong password.");
	}
};

module.exports = {
	validateSignUpData,
	validateProfileEditData,
	validateUpdatePasswordData,
};
