const express = require("express");

const app = express();

// we'll get a response but also an error as the connection gets closed after the response.
// app.get(
// 	"/user",
// 	(req, res, next) => {
// 		res.send({
// 			firstName: "John",
// 			lastName: "Doe",
// 			userId: req.params.userId,
// 		});
// 		next();
// 	},
// 	(req, res) => {
// 		res.send({
// 			firstName: "John",
// 			lastName: "Doe",
// 			userId: req.query.userId,
// 		});
// 	}
// );

// This will work as expected, the response will be sent and the connection will not be closed prematurely.
app.get(
	"/user",
	(req, res, next) => {
		console.log("first middleware");
		next();
	},
	(req, res) => {
		console.log("second middleware");
		res.send({
			firstName: "John",
			lastName: "Doe",
		});
	}
);

// this will run into timeout issues as nothing will happen in the first middleware
// app.get(
// 	"/user",
// 	(req, res, next) => {
// 		console.log("first middleware");
// 	},
// 	(req, res) => {
// 		// this will not be reached as the first middleware does not call next()
// 		res.send({
// 			firstName: "John",
// 			lastName: "Doe",
// 			userId: req.query.userId,
// 		});
// 	}
// );

// This will also return a response for the second mmiddleware but also cause error for the
// first middleware as res.send will be called after the second middleware has already sent a response.
// app.get(
// 	"/user",
// 	(req, res, next) => {
// 		console.log("first middleware");
// 		next();
// 		res.send({
// 			firstName: "John",
// 			lastName: "Doe",
// 			userId: req.query.userId,
// 		});
// 	},
// 	(req, res) => {
// 		console.log("second middleware");
// 		res.send({
// 			firstName: "Second",
// 			lastName: "Doe",
// 			userId: req.query.userId,
// 		});
// 	}
// );

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
