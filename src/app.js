const express = require("express");

const app = express();

app.use("/", (req, res) => {
	res.send("Home!");
});

app.use("/hello", (req, res) => {
	res.send("Hello, World!");
});

app.use("/new", (req, res) => {
	res.send("New!");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
