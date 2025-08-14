const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");

const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");

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
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).send("Invalid password");
		}
		res.status(200).send("Login successful");
	} catch (error) {
		res.status(400).send("Error logging in: " + error.message);
	}
});

app.get("/user", async (req, res) => {
	const email = req.body.email;
	try {
		const user = await User.find({ email });
		if (user.length === 0) {
			return res.status(404).send("User not found");
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(400).send("Error fetching user: " + error.message);
	}
});

app.get("/feed", async (req, res) => {
	const userFeed = await User.find({});
	try {
		if (userFeed.length === 0) {
			return res.status(404).send("No users found");
		}
		res.status(200).send(userFeed);
	} catch (error) {
		res.status(400).send("Error fetching feed: " + error.message);
	}
});

app.patch("/user/:userId", async (req, res) => {
	const ALLOWED_UPDATES = [
		"firstName",
		"lastName",
		"password",
		"age",
		"skills",
		"gender",
		"ProfilePicture",
	];
	const userId = req.params?.userId;
	try {
		Object.keys(req.body).forEach((field) => {
			if (!ALLOWED_UPDATES.includes(field)) {
				throw new Error(`Invalid update: ${field}`);
			}
		});
		const user = await User.findByIdAndUpdate(userId, req.body, {
			returnDocument: "after",
			runValidators: true,
		});
		res.status(200).send("User updated successfully");
	} catch (error) {
		res.send("Error updating user: " + error.message);
	}
});
