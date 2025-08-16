const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const user = require("../models/user");

const userRouter = express.Router();

userRouter.get(
	"/user/requests/received",
	userAuthentication,
	async (req, res) => {
		try {
			const userId = req.user._id;
			const connectionRequests = await ConnectionRequest.find({
				toUserId: userId,
				status: "interested",
			}).populate(
				"fromUserId",
				"firstName lastName profilePicture age about gender"
			);

			res.json({
				message: `Hi, ${req.user.firstName}, You have received ${connectionRequests.length} connection requests `,
				connectionRequests,
			});
		} catch (error) {
			res.status(400).send(
				"Error fetching received requests: " + error.message
			);
		}
	}
);

userRouter.get("/user/connections", userAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const connections = await ConnectionRequest.find({
			$or: [
				{ fromUserId: userId, status: "accepted" },
				{ toUserId: userId, status: "accepted" },
			],
		}).populate(
			"fromUserId toUserId",
			"firstName lastName profilePicture age about gender"
		);
		const formatedConnections = connections.map((connection) => {
			return connection.fromUserId._id.equals(userId)
				? connection.toUserId
				: connection.fromUserId;
		});

		res.json({
			message: `${req.user.firstName}, You have ${connections.length} connections`,
			formatedConnections,
		});
	} catch (error) {
		res.status(400).send("Error fetching connections: " + error.message);
	}
});

module.exports = userRouter;
