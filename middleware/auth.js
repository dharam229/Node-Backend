const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	//return res.status(200).send({type: 'unauthorized', message: "Invalid Token"});
	const token = req.body.token || req.query.token || req.headers["x-access-token"];
	if (!token) {
		return res.status(200).send({type: 'error', message: "A authorization token is required for user authentication"});
	}
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		req.user = decoded;
	} catch (err) {
		//return res.status(200).send({type: 'unauthorized', message: "Invalid Token"});
		return res.status(200).send({type: 'unauthorized', message: "Session expired please login to proceed"});
	}
	return next();
};

module.exports = verifyToken;