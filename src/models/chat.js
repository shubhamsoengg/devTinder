const express = require("express");
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1000, // Limit message length to 1000 characters
		},
	},
	{ timestamps: true }
);

const chatSchema = new mongoose.Schema(
	{
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		messages: [messageSchema],
	},
	{ timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Chat, Message };
