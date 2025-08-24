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

			return sendResponse(
				res,
				200,
				true,
				connectionRequests,
				`Hi, ${req.user.firstName}, you have received ${connectionRequests.length} connection request(s)`
			);
		} catch (error) {
			return sendResponse(
				res,
				400,
				false,
				null,
				"Error fetching received requests",
				[{ field: "requests", message: error.message }]
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
		const formattedConnections = connections.map((connection) => {
			return connection.fromUserId._id.equals(userId)
				? connection.toUserId
				: connection.fromUserId;
		});

		return sendResponse(
			res,
			200,
			true,
			formattedConnections,
			`${req.user.firstName}, you have ${connections.length} connection(s)`
		);
	} catch (error) {
		return sendResponse(
			res,
			400,
			false,
			null,
			"Error fetching connections",
			[{ field: "connections", message: error.message }]
		);
	}
});

userRouter.get("/user/feed", userAuthentication, async (req, res) => {
	const limit = parseInt(req.query.limit) || 10;
	if (limit < 1 || limit > 100) {
		return sendResponse(
			res,
			400,
			false,
			null,
			"Limit must be between 1 and 100",
			[{ field: "limit", message: "Invalid limit parameter" }]
		);
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

		return sendResponse(
			res,
			200,
			true,
			feedUserData,
			`Hi, ${req.user.firstName}, you have ${feedUserData.length} user(s) in your feed`
		);
	} catch (error) {
		return sendResponse(res, 400, false, null, "Error fetching feed", [
			{ field: "feed", message: error.message },
		]);
	}
});

module.exports = userRouter;
