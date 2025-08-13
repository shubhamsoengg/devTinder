const mongoose = require("mongoose");

const connectDB = async () => {
	await mongoose.connect(
		"mongodb+srv://sgoyal28:SkDVp1IsiqAgVMPf@cluster0.i0lyzsg.mongodb.net/devTinder"
	);
	console.log("MongoDB connected successfully");
};

module.exports = connectDB;
