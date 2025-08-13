const express = require("express");
const {
	adminAuthentication,
	userAuthentication,
} = require("./middlewares/auth");

const app = express();

// Middlewares
app.use("/admin", adminAuthentication);

app.get("/admin/getProfile", (req, res) => {
	console.log("Getting profile data...");
	res.send({
		firstName: "John",
		lastName: "Doe",
	});
});

app.get("/user/getAllData", userAuthentication, (req, res) => {
	console.log("Getting all data...");
	res.send("All data retrieved successfully!");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
