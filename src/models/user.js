const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true, // Remove leading and trailing whitespace
			minlength: 2, // Minimum length for first name
			maxlength: 50, // Maximum length for first name
			validate(value) {
				if (!/^[a-zA-Z]+$/.test(value)) {
					throw new Error("First name must contain only letters");
				}
			},
		},
		lastName: {
			type: String,
			trim: true, // Remove leading and trailing whitespace
			minlength: 2, // Minimum length for last name
			maxlength: 50, // Maximum length for last name
			validate(value) {
				if (!/^[a-zA-Z]+$/.test(value)) {
					throw new Error("Last name must contain only letters");
				}
			},
		},
		email: {
			type: String,
			required: true,
			index: true, // Create an index for faster lookups
			unique: true,
			lowercase: true, // Ensure email is stored in lowercase
			trim: true, // Remove leading and trailing whitespace
			validate(value) {
				if (validator.isEmail(value) === false) {
					throw new Error("Email is invalid");
				}
			},
		},
		password: {
			type: String,
			required: true,
			minlength: 6, // Minimum length for password
			validate(value) {
				if (
					value.length < 6 ||
					value.length > 128 ||
					!/[A-Z]/.test(value) ||
					!/[a-z]/.test(value) ||
					!/[0-9]/.test(value)
				) {
					throw new Error(
						"Password must be 6-128 characters and contain upper case, lower case, and a number"
					);
				}
			},
		},
		age: {
			type: Number,
			validate(value) {
				if (value < 18 || value > 50) {
					throw new Error("Age must be between 18 and 50");
				}
			},
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
		},
		profilePicture: {
			type: String,
			default: "https://api.dicebear.com/6.x/bottts/svg?seed=developer", // Placeholder URL
		},
		about: {
			type: String,
			trim: true, // Remove leading and trailing whitespace
			maxlength: 500, // Maximum length for about section
		},
		skills: {
			type: [String],
			default: [],
			set: (skills) => Array.from(new Set(skills)), // Remove duplicates
			validate(value) {
				if (
					value.length > 0 &&
					(value.length < 1 || value.length > 10)
				) {
					throw new Error(
						"Skills must contain between 1 and 10 items"
					);
				}
			},
		},
	},
	{ timestamps: true }
);

userSchema.methods.getJWT = async function () {
	const user = this;
	const jwtToken = jwt.sign({ _id: user._id }, "my_test_secret", {
		expiresIn: "1d",
	});
	return jwtToken;
};

userSchema.methods.validateUserPassword = async function (userInputPassword) {
	const user = this;
	const passwordHash = user.password;
	const isPasswordValid = await bcrypt.compare(
		userInputPassword,
		passwordHash
	);
	return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
