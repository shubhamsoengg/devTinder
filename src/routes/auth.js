const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
	try {
		console.log("inside signup route");
		const { firstName, lastName, email, password } = req.body;
		// 1. Validate request body
		validateSignUpData(req);

		// 2. Encrypt password
		const passwordHash = await bcrypt.hash(password, 10);
		const user = new User({
			firstName,
			lastName,
			email,
			password: passwordHash,
		});
		await user.save();
		res.status(201).send("User created successfully");
	} catch (error) {
		res.send("Error creating user: " + error.message);
	}
});

authRouter.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).send("User not found");
		}
		const isPasswordValid = await user.validateUserPassword(password);
		if (!isPasswordValid) {
			return res.status(401).send("Invalid password");
		}
		const token = await user.getJWT();
		res.cookie("token", token);
		res.status(200).send("Login successful");
	} catch (error) {
		res.status(400).send("Error logging in: " + error.message);
	}
});

authRouter.post("/logout", async (req, res) => {
	res.cookie("token", null, { expires: new Date(Date.now()) }).send(
		"Logged out successfully"
	);
});

module.exports = authRouter;
