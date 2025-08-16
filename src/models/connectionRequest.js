const req = require("express/lib/request");
const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		status: {
			type: String,
			enum: {
				values: ["accepted", "rejected", "ignored", "interested"],
				message: "Incorrect status value",
			},
		},
	},
	{ timestamps: true }
);

connectionRequestSchema.pre("save", function (next) {
	const connectionRequest = this;
	if (!connectionRequest.fromUserId || !connectionRequest.toUserId) {
		throw new Error("fromUserId and toUserId are required");
	}
	if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
		throw new Error("You cannot send a connection request to yourself");
	}
	next();
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

module.exports = new mongoose.model(
	"ConnectionRequest",
	connectionRequestSchema
);
