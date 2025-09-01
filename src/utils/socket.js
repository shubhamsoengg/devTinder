const socket = require("socket.io");
const { Chat } = require("../models/chat");

const generateRoomId = (userId1, userId2) => {
	return [userId1, userId2].sort().join("_");
};

const persistMessage = async (sourceUserId, targetUserId, message) => {
	try {
		let chat = await Chat.findOne({
			participants: { $all: [sourceUserId, targetUserId] },
		});
		if (!chat) {
			chat = new Chat({
				participants: [sourceUserId, targetUserId],
				messages: [],
			});
		}
		chat.messages.push({
			senderId: sourceUserId,
			receiverId: targetUserId,
			message,
		});
		const chatData = await chat.save();
		console.log("Message persisted:", chatData);
		return chat.messages[chatData.messages.length - 1];
	} catch (error) {
		console.error("Error persisting message:", error);
	}
};

const initiateSocket = (server) => {
	const io = socket(server, {
		cors: {
			origin: "http://localhost:5173",
			credentials: true,
		},
	});

	io.on("connection", (socket) => {
		console.log("New client connected: ", socket.id);

		socket.on("joinRoom", ({ firstName, sourceUserId, targetUserId }) => {
			const room = generateRoomId(sourceUserId, targetUserId);
			socket.join(room);
			console.log(`${firstName} joined room ${room}`);
		});

		socket.on(
			"sendMessage",
			async ({ firstName, sourceUserId, targetUserId, message }) => {
				const room = generateRoomId(sourceUserId, targetUserId);
				console.log(
					`Message from ${firstName} to room ${room}: ${message}`
				);

				const persistedMessage = await persistMessage(
					sourceUserId,
					targetUserId,
					message
				);

				io.to(room).emit("receiveMessage", {
					message: persistedMessage,
					firstName,
				});
			}
		);

		socket.on("disconnect", () => {
			console.log("Client disconnected: ", socket.id);
		});
	});
};

module.exports = initiateSocket;
