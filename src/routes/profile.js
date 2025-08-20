const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const {
	validateProfileEditData,
	validateUpdatePasswordData,
} = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuthentication, async (req, res) => {
	try {
		const user = req.user; // User is set by the userAuthentication middleware
		res.status(200).send(user);
	} catch (error) {
		res.status(400).send("Error fetching profile: " + error.message);
	}
});

profileRouter.patch("/profile/edit", userAuthentication, async (req, res) => {
	try {
		validateProfileEditData(req); // Assuming you have a validation function for profile edits
		const loggedInUser = req.user; // User is set by the userAuthentication middleware
		Object.keys(req.body).forEach((key) => {
			loggedInUser[key] = req.body[key]; // Update user fields with the request body
		});
		await loggedInUser.save();
		res.status(200).json({
			message: `${loggedInUser.firstName}, Your profile updated successfully!`,
			data: loggedInUser,
		});
	} catch (error) {
		res.status(400).send("Error updating profile: " + error.message);
	}
});

profileRouter.patch(
	"/profile/updatePassword",
	userAuthentication,
	async (req, res) => {
		try {
			await validateUpdatePasswordData(req);

			const { newPassword } = req.body;

			const loggedInUser = req.user; // User is set by the userAuthentication middleware
			loggedInUser.password = await bcrypt.hash(newPassword, 10); // Update the password
			await loggedInUser.save();
			res.status(200).send(
				"Password updated successfully for " + loggedInUser.firstName
			);
		} catch (error) {
			res.status(400).send("Error updating password: " + error.message);
		}
	}
);

module.exports = profileRouter;
