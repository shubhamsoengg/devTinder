const express = require("express");
const connectDB = require("./config/database");

const User = require("./models/user");

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
	// Assuming req.body contains user data

	const user = new User(req.body);
	try {
		await user.save();
		res.status(201).send("User created successfully");
	} catch (error) {
		res.send("Error creating user: " + error.message);
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

app.patch("/user", async (req, res) => {
	const userId = req.body.userId;
	const user = await User.findByIdAndUpdate(userId, req.body, {
		returnDocument: "after",
		runValidators: true,
	});
	res.status(200).send("User updated successfully");
});
