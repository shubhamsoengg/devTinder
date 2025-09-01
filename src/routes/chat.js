const express = require("express");

const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuthentication } = require("../middlewares/auth");
const sendResponse = require("../utils/sendResponse");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuthentication, async (req, res) => {
	try {
		// Get the authenticated user's ID
		// and the target user's ID from the request parameters
		// check if the target user is a connection
		//  fetch the messages, and return.

		const userId = req.user._id;
		const { targetUserId } = req.params;

		const isConnection = await ConnectionRequest.findOne({
			$or: [
				{
					fromUserId: userId,
					toUserId: targetUserId,
					status: "accepted",
				},
				{
					fromUserId: targetUserId,
					toUserId: userId,
					status: "accepted",
				},
			],
		});

		if (!isConnection) {
			return sendResponse(
				res,
				403,
				false,
				null,
				"You are not connected with this user",
				[{ field: "connection", message: "Not connected" }]
			);
		}

		const chat = await Chat.findOne({
			participants: { $all: [userId, targetUserId] },
		}).populate("messages.senderId", "firstName lastName profilePicture");

		if (!chat) {
			return sendResponse(
				res,
				200,
				true,
				{ messages: [] },
				"No chat history found"
			);
		}
		return sendResponse(res, 200, true, chat, "Chat fetched successfully");
	} catch (error) {
		return sendResponse(res, 400, false, null, "Error fetching chat", [
			{ field: "chat", message: error.message },
		]);
	}
});

module.exports = chatRouter;
