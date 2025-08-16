const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const req = require("express/lib/request");
const requestRouter = express.Router();

requestRouter.post(
	"/request/send/:status/:toUserId",
	userAuthentication,
	async (req, res) => {
		try {
			const { status, toUserId } = req.params;
			const fromUserId = req.user._id;

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
				return res
					.status(400)
					.send(
						"Connection request already exists between these users"
					);
			}

			const checkToUser = await User.findById(toUserId);
			if (!checkToUser) {
				return res
					.status(404)
					.json({ message: "To user not found", status: "error" });
			}

			const connectionRequest = new ConnectionRequest({
				fromUserId,
				toUserId,
				status,
			});
			const connectionRequestData = await connectionRequest.save();

			res.json({
				message:
					status === "interested"
						? "Connection request sent successfully"
						: "Connection request ignored",
				connectionRequest: connectionRequestData,
			});
		} catch (error) {
			res.status(400).send(
				"Error sending connection request: " + error.message
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
				return res
					.status(404)
					.send("Connection request not found or already processed");
			}

			// Update the status of the connection request
			connectionRequest.status = status;
			const updatedRequest = await connectionRequest.save();
			res.json({
				message: `Connection request ${status}`,
				connectionRequest: updatedRequest,
			});
		} catch (error) {
			res.status(400).send(
				"Error reviewing connection request: " + error.message
			);
		}
	}
);

module.exports = requestRouter;
