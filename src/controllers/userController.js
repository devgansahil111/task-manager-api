const { default: mongoose } = require("mongoose");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Schema.Types.ObjectId;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendWelcomeEmail, sendCancelEmail} = require("../email/account");

// ----------------------------------------------------------------------------------------------- //
// Validation Format

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

// --------------------------------------------------------------------------------------------- //
// Create User

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { name, email, password, age } = data;  // Destructuring

        if (Object.keys(data).length == 0) {
            res.status(400).send({ status: false, msg: "BAD REQUEST" });    // javascript property
            return
        }
        if (!isValid(name)) {
            res.status(400).send({ status: false, msg: "Username is required" });
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: "Email is required" });
            return
        }
        if (!(emailRegex.test(email))) {
            res.status(400).send({ status: false, msg: "Email should be valid email address" });
            return
        }
        let isEmailAlreadyExist = await userModel.findOne({ email })
        if (isEmailAlreadyExist) {
            res.status(400).send({ status: false, msg: "You have registered with this EmailId, Please enter another email" });
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, msg: "Password is required" });
            return
        }

        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);

        if (password.length < 8 || password.length > 15) {
            res.status(400).send({ status: false, msg: "Password range should be between 8 to 15" });
            return
        }
        if (!isValid(age)) {
            res.status(400).send({ status: false, msg: "Age is required" });
            return
        }
        if (!isValid(age > 0 || age < 100)) {
            res.status(400).send({ status: false, msg: "The Age should be between 0 to 100" });
            return
        } else {
            let finalUser = await userModel.create(data);
            // sendWelcomeEmail(data.email, data.name);
            // console.log("Welcome mail sent!");
            res.status(201).send({ status: true, msg: "Successfully Created", data: finalUser });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ---------------------------------------------------------------------------------------------- //
// Get User By Params

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId;

        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "UserId is required" });
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(404).send({ status: false, msg: "Invalid UserId" });
            return
        }

        let userData = await userModel.findById({ _id: userId })
        if (!isValid(userData)) {
            res.status(400).send({ status: false, msg: "There is no user with this userId" });
            return
        } else {
            res.status(200).send({ status: true, msg: "Congratulations", data: userData });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// --------------------------------------------------------------------------------------------- //
// Get User By Query

const getUserQuery = async function (req, res) {
    try {
        let data = req.query;
        let { userId } = data;

        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "UserId not found" });
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(404).send({ status: false, msg: "Invalid UserId" });
            return
        }

        let userData = await userModel.findById({ _id: userId })
        if (!isValid(userData)) {
            res.status(400).send({ status: false, msg: "There is no user with this userId" });
            return
        } else {
            res.status(200).send({ status: true, msg: "Congratulations", data: userData });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// -------------------------------------------------------------------------------------------- //
// Update User

const updateUser = async function (req, res) {
    try {
        let data = req.body;
        let { name, email, password, age } = data;
        let userId = req.params.userId;

        let filter = {};

        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "UserId not found" });
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(404).send({ status: false, msg: "Invalid UserId" });
            return
        }
        // Autherization
        if (req.params.userId != req.body.userId) {
            res.status(403).send({ status: false, message: "User not authorized" });
            return
        }
        if (!isValid(data)) {
            res.status(400).send({ status: false, msg: "Please provide input via body" });
            return
        }
        if (isValid(name)) {
            filter["name"] = name;
        }
        if (isValid(email)) {
            filter["email"] = email;
        }
        if (isValid(password)) {
            filter["password"] = password;
        }
        if (isValid(age)) {
            filter["age"] = age;
        }
        else {
            let updatedData = await userModel.findOneAndUpdate({ _id: userId }, { $set: filter }, { new: true });
            res.status(200).send({ status: false, msg: "Successfully Updated!", data: updatedData });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// --------------------------------------------------------------------------------------------- //
// Delete User Data

const deleteUser = async function (req, res) {
    try {
        let data = req.body;
        let userId = req.params.userId;

        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "userId is required" });
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: "Invalid userId" });
            return
        }
        // Autherization
        if (req.params.userId != req.body.userId) {
            res.status(403).send({ status: false, message: "User not authorized" });
            return
        }
        let deletedUser = await userModel.findOneAndDelete({ _id: userId }, { new: true });
        if (!isValid(deletedUser)) {
            res.status(404).send({ status: false, msg: "User not found" });
            return
        } else {
            email.sendCancelEmail(data.email, data.name);
            console.log("Email Cancelled!");
            res.status(200).send({ status: true, msg: "User deleted successfully" });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// --------------------------------------------------------------------------------------------- //
// Login User

const loginUser = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data;

        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: "email is required" })
            return
        }
        if (!(emailRegex.test(email))) {
            res.status(400).send({ status: false, msg: "email should be valid email address" })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, msg: "password is required" })
            return
        }
        if (password.length < 8 || password.length > 15) {
            res.status(400).send({ status: false, msg: "Password range should be between 8 to 15" });
            return
        }
        let userDetails = await userModel.findOne({ email: email });
        if (!userDetails) {
            res.status(400).send({ status: false, msg: "Email not matched" });
            return
        }
        let match = await bcrypt.compare(password, userDetails.password);
        if (match) {
            // After Decrypting
            let token = jwt.sign({ userId: userDetails._id }, "yeh_dil_mange_more", { expiresIn: "24h" });
            res.setHeader("x-api-key", token);
            res.status(201).send({ status: true, data: token });
        }
        else {
            res.status(400).send({ status: false, message: "Incorrect Password" });
            return
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
};

// ---------------------------------------------------------------------------------------------- //

module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.getUserQuery = getUserQuery;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.loginUser = loginUser;