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

app.post("/signup", async (req, res) => {
	const user = new User({
		firstName: "test",
		lastName: "test",
		email: "test@kohli.com",
		password: "password123",
		age: 25,
	});
	try {
		await user.save();
		res.status(201).send("User created successfully");
	} catch (error) {
		res.status(400).send("Error creating user: " + error.message);
	}
});
