const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const sendResponse = require("../utils/sendResponse");

const requestRouter = express.Router();

requestRouter.post(
	"/request/send/:status/:toUserId",
	userAuthentication,
	async (req, res) => {
		try {
			const { status, toUserId } = req.params;
			const fromUserId = req.user._id;

			const emailResponse = await sendEmail();
			console.log(emailResponse);
			if (!["interested", "ignored"].includes(status)) {
				throw new Error("Invalid status for connection request");
			}

			const existingConnectionRequest = await ConnectionRequest.findOne({
				$or: [
					{ fromUserId, toUserId },
					{ fromUserId: toUserId, toUserId: fromUserId }, // Allow requests in both directions
				],
			});
			if (existingConnectionRequest) {
				return sendResponse(
					res,
					400,
					false,
					null,
					"Connection request already exists between these users",
					[{ field: "connection", message: "Duplicate request" }]
				);
			}

			const checkToUser = await User.findById(toUserId);
			if (!checkToUser) {
				return sendResponse(
					res,
					404,
					false,
					null,
					"To user not found",
					[{ field: "toUserId", message: "User does not exist" }]
				);
			}

			const connectionRequest = new ConnectionRequest({
				fromUserId,
				toUserId,
				status,
			});
			const connectionRequestData = await connectionRequest.save();

			return sendResponse(
				res,
				200,
				true,
				connectionRequestData,
				status === "interested"
					? "Connection request sent successfully"
					: "Connection request ignored"
			);
		} catch (error) {
			return sendResponse(
				res,
				400,
				false,
				null,
				"Error sending connection request",
				[{ field: "connection", message: error.message }]
			);
		}
	}
);

requestRouter.post(
	"/request/review/:status/:requestId",
	userAuthentication,
	async (req, res) => {
		try {
			const { status, requestId } = req.params;
			const userId = req.user._id;
			// The valid statuses can be accepted and rejected
			if (!["accepted", "rejected"].includes(status)) {
				throw new Error("Invalid status for connection request");
			}
			const connectionRequest = await ConnectionRequest.findOne({
				_id: requestId,
				toUserId: userId, // Ensure the request is for the current user
				status: "interested", // Only process requests that are interested
			});

			if (!connectionRequest) {
				return sendResponse(
					res,
					404,
					false,
					null,
					"Connection request not found or already processed",
					[
						{
							field: "connection",
							message: "Invalid or processed request",
						},
					]
				);
			}

			// Update the status of the connection request
			connectionRequest.status = status;
			const updatedRequest = await connectionRequest.save();

			const emailResponse = await sendEmail();

			console.log("Email sent response: ", emailResponse);

			return sendResponse(
				res,
				200,
				true,
				updatedRequest,
				`Connection request ${status}`
			);
		} catch (error) {
			return sendResponse(
				res,
				400,
				false,
				null,
				"Error reviewing connection request",
				[{ field: "connection", message: error.message }]
			);
		}
	}
);

module.exports = requestRouter;
