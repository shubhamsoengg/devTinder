const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const sendResponse = require("../utils/sendResponse");
const bcrypt = require("bcrypt");
const {
	validateProfileEditData,
	validateUpdatePasswordData,
} = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuthentication, async (req, res) => {
	try {
		const user = req.user; // User is set by the userAuthentication middleware
		// res.status(200).send(user);
		sendResponse(res, 200, true, user, "User profile fetched successfully");
	} catch (error) {
		sendResponse(
			res,
			400,
			false,
			null,
			"Error fetching profile",
			error.message
		);
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
		return sendResponse(
			res,
			200,
			true,
			loggedInUser,
			`${loggedInUser.firstName}, your profile was updated successfully!`
		);
	} catch (error) {
		return sendResponse(res, 400, false, null, "Error updating profile", [
			{ field: "profile", message: error.message },
		]);
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
			return sendResponse(
				res,
				200,
				true,
				null,
				`Password updated successfully for ${loggedInUser.firstName}`
			);
		} catch (error) {
			return sendResponse(
				res,
				400,
				false,
				null,
				"Error updating password",
				[{ field: "password", message: error.message }]
			);
		}
	}
);

module.exports = profileRouter;
