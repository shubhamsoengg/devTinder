const express = require("express");
const { userAuthentication } = require("../middlewares/auth");
const Payment = require("../models/payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cookieParser = require("cookie-parser");

const sendResponse = require("../utils/sendResponse");
const paymentRouter = express.Router();

paymentRouter.post(
	"/payment/createIntent",
	express.json(),
	cookieParser(),
	userAuthentication,
	async (req, res) => {
		try {
			const membershipPlan = req?.body?.membershipPlan || "premium";
			const { _id, firstName, lastName } = req.user;
			console.log(firstName, lastName, membershipPlan, _id);
			// Create a PaymentIntent with the order amount and currency
			const paymentIntent = await stripe.paymentIntents.create({
				amount: 7000, // amount in cents
				currency: "usd",
				// In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
				automatic_payment_methods: {
					enabled: true,
				},
				metadata: {
					firstName,
					lastName,
					membershipPlan,
					userId: _id.toString(),
				},
			});
			console.log(paymentIntent);

			const paymentRecord = new Payment({
				userId: _id,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				paymentIntentId: paymentIntent.id,
				status: paymentIntent.status,
				metadata: paymentIntent.metadata,
			});
			const savedPayment = await paymentRecord.save();
			console.log("Payment record saved: ", savedPayment);

			return sendResponse(
				res,
				200,
				true,
				{
					...savedPayment.toJSON(),
					clientSecret: paymentIntent.client_secret,
				},
				"Payment intent created successfully"
			);
		} catch (error) {
			console.error("Error creating payment intent: ", error);
			return sendResponse(
				res,
				500,
				false,
				{},
				"Internal Server Error. Unable to create payment intent."
			);
		}
	}
);

paymentRouter.post(
	"/payment/paymentWebhook",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		try {
			const sig = req.headers["stripe-signature"];
			const event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET
			);

			// Handle the event
			switch (event.type) {
				case "payment_intent.succeeded":
					const paymentIntent = event.data.object;
					console.log("PaymentIntent was successful!");
					// Then define and call a method to handle the successful payment intent.
					// handlePaymentIntentSucceeded(paymentIntent);
					const paymentRecord = await Payment.findOne({
						paymentIntentId: paymentIntent.id,
					});
					if (paymentRecord) {
						paymentRecord.status = paymentIntent.status;
						await paymentRecord.save();
						console.log(
							"Payment record updated to succeeded: ",
							paymentRecord
						);
						// Update user to premium
						const user = await require("../models/user").findById(
							paymentRecord.userId
						);
						if (user) {
							user.premiumUser = true;
							const currentDate = new Date();
							if (
								user.premiumExpiry &&
								user.premiumExpiry > currentDate
							) {
								// If current expiry is in the future, extend from that date
								user.premiumExpiry = new Date(
									user.premiumExpiry.setMonth(
										user.premiumExpiry.getMonth() + 1
									)
								);
							} else {
								// Else, set expiry to one month from now
								user.premiumExpiry = new Date(
									currentDate.setMonth(
										currentDate.getMonth() + 1
									)
								);
							}
							await user.save();
							console.log("User upgraded to premium: ", user);
						}
					} else {
						console.log(
							"No payment record found for PaymentIntent ID: ",
							paymentIntent.id
						);
					}
					break;
				// ... handle other event types
				default:
					console.log(`Unhandled event type ${event.type}`);
			}

			// Return a 200 response to acknowledge receipt of the event
			res.send();
		} catch (error) {
			console.error("Error handling webhook: ", error);
			res.status(400).send(`Webhook Error: ${error.message}`);
		}
	}
);

module.exports = paymentRouter;
