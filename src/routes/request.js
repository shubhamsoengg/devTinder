const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const requestRouter = express.Router();

requestRouter.post(
	"/sendConnectionRequest",
	userAuthentication,
	async (req, res) => {
		try {
			res.send("Connection request sent successfully");
		} catch (error) {
			res.status(400).send(
				"Error sending connection request: " + error.message
			);
		}
	}
);

module.exports = requestRouter;
