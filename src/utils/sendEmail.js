const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async () => {
	const { data, error } = await resend.emails.send({
		from: "DevConn <noreply@dev-conn.biz>",
		to: ["shu1993bhum@gmail.com"],
		subject: "Hello World",
		html: "<strong>It works!</strong>",
	});

	if (error) {
		return console.error({ error });
	}

	console.log({ data });
};

module.exports = sendEmail;
