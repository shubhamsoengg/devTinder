const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		paymentIntentId: {
			type: String,
			required: true,
		},
		paymentId: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
			default: "usd",
		},
		status: {
			type: String,
			default: "pending",
		},
		paymentMethod: {
			type: String,
			enum: ["card", "paypal", "stripe"],
		},
		metadata: {
			type: Object,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
