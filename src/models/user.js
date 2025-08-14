const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true, // Ensure email is stored in lowercase
			trim: true, // Remove leading and trailing whitespace
		},
		password: {
			type: String,
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
		},
		profilePicture: {
			type: String,
			default: "https://example.com/default-profile-picture.png", // Placeholder URL
		},
		skills: {
			type: [String],
		},
	},
	{ timestamps: true }
); // Automatically manage createdAt and updatedAt fields

module.exports = mongoose.model("User", userSchema);
