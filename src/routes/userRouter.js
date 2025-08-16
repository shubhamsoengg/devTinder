const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

const USER_SAFE_FIELDS =
	"firstName lastName profilePicture age gender about skills";

userRouter.get(
	"/user/requests/received",
	userAuthentication,
	async (req, res) => {
		try {
			const userId = req.user._id;
			const connectionRequests = await ConnectionRequest.find({
				toUserId: userId,
				status: "interested",
			}).populate("fromUserId", USER_SAFE_FIELDS);

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
		}).populate("fromUserId toUserId", USER_SAFE_FIELDS);
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

userRouter.get("/user/feed", userAuthentication, async (req, res) => {
	const limit = parseInt(req.query.limit) || 10;
	if (limit < 1 || limit > 100) {
		return res.status(400).send("Limit must be between 1 and 100");
	}
	const page = parseInt(req.query.page) || 1;
	const skipCount = (page - 1) * limit;

	try {
		const userId = req.user._id;
		const connections = await ConnectionRequest.find({
			$or: [{ fromUserId: userId }, { toUserId: userId }],
		}).select("fromUserId toUserId");

		const connectedUserIdSet = new Set();
		connections.forEach((connection) => {
			connectedUserIdSet.add(connection.fromUserId);
			connectedUserIdSet.add(connection.toUserId);
		});

		const feedUserData = await User.find({
			_id: { $nin: [userId, ...Array.from(connectedUserIdSet)] },
		})
			.select(USER_SAFE_FIELDS)
			.skip(skipCount)
			.limit(limit);

		res.json({
			message: `Hi, ${req.user.firstName}, You have ${feedUserData.length} users in your feed`,
			feed: feedUserData,
		});
	} catch (error) {
		res.status(400).send("Error fetching feed: " + error.message);
	}
});

module.exports = userRouter;
