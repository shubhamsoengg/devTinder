const express = require("express");

const app = express();

app.get("/user/:userId", (req, res) => {
	res.send({ firstName: "John", lastName: "Doe", userId: req.params.userId });
});

app.get("/user2", (req, res) => {
	res.send({ firstName: "John", lastName: "Doe", userId: req.query.userId });
});

app.post("/user", (req, res) => {
	res.send("User created!");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
