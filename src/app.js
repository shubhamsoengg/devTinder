const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const { userAuthentication } = require("./middlewares/auth");

const app = express();

connectDB()
	.then(() => {
		console.log("Database connection established");
		app.listen(3000, () => {
			console.log("Server is running on port 3000");
		});
	})
	.catch((err) => {
		console.error("Database connection failed:", err);
	});

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies

app.post("/signup", async (req, res) => {
	try {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuthentication, async (req, res) => {
	try {
		const user = req.user; // User is set by the userAuthentication middleware
		res.status(200).send(user);
	} catch (error) {
		res.status(400).send("Error fetching profile: " + error.message);
	}
});

app.post("/sendConnectionRequest", userAuthentication, async (req, res) => {
	try {
		res.send("Connection request sent successfully");
	} catch (error) {
		res.status(400).send(
			"Error sending connection request: " + error.message
		);
	}
});
