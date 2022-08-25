const jwt = require("jsonwebtoken");

// ------------------------------------------------------------------------------------- //

const auth = async function(req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if(!token) {
            res.status(400).send({ status: false, msg: "Token required" });
            return
        }
        let decodedToken = jwt.decode(token);
        if(!decodedToken) {
            res.status(400).send({ status: false, msg: "Invalid Token!" });
            return
        }
        jwt.verify(token, "yeh_dil_mange_more");
        req.loggedInUser = decodedToken.userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ------------------------------------------------------------------------------------------ //

module.exports.auth = auth;