// utils/response.js

/**
 * Standardized API response formatter
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - whether request was successful
 * @param {object|null} data - actual payload
 * @param {string} message - human-readable message
 * @param {object|array|null} errors - validation or server errors
 */
const sendResponse = (
	res,
	statusCode,
	success,
	data = null,
	message = "",
	errors = null
) => {
	return res.status(statusCode).json({
		success,
		data,
		message,
		errors,
	});
};

module.exports = sendResponse;
