const express = require("express");
const connectDB = require("./config/database");

const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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
