const { default: mongoose } = require("mongoose");
const taskModel = require("../models/taskModel");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Schema.Types.ObjectId;
const middleware = require("../middleware/midd");

// --------------------------------------------------------------------------------- //
// Validation Format

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

// ------------------------------------------------------------------------------- //
// Create Task

const createTask = async function(req, res) {
    try {
        let data = req.body;
        let { description, completed, owner } = data;

        if (Object.keys(data).length == 0) {
            res.status(400).send({ status: false, msg: "BAD REQUEST" });    // javascript property
            return
        }
        if (!isValid(description)) {
            res.status(400).send({ status: false, msg: "Task description is mandatory "});
            return
        }
        if (!isValid(completed)) {
            res.status(400).send({ status: false, msg: "completed field is required "});
            return
        }
        if (!isValid(owner)) {
            res.status(400).send({ status: false, msg: "Owner is mandatory "});
            return
        }
        if (!isValid(owner)) {
            res.status(400).send({ status: false, msg: "Invalid Owner "});
            return
        }
        // Autherization
        if (userId != req.owner.userId) {
            res.status(403).send({ status: false, message: "User not authorized" });
            return
        } else {
            let createdTask = await taskModel.create(data);
            res.status(201).send({ status: true, msg: "Successfull Created!", data: createdTask });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ---------------------------------------------------------------------------------------- //
// Get Task

const getTask = async function(req, res) {
    try {
        let taskId = req.params.taskId;

        if (!isValid(taskId)) {
            res.status(400).send({ status: false, msg: "TaskId is required" });
            return
        }
        if (!isValidObjectId(taskId)) {
            res.status(404).send({ status: false, msg: "Invalid TaskId" });
            return
        }

        let taskDetails = await taskModel.findOne({ _id: taskId });
        if(!isValid(taskDetails)) {
            res.status(400).send({ status: false, msg: "There is no task with this taskId" });
            return
        } else {
            res.status(200).send({ status: true, msg: "Congratulations", data: taskDetails });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ---------------------------------------------------------------------------------------- //
// Get By Query Params

const getTaskQuery = async function(req, res) {
    try {
        let data = req.query;
        let { taskId, description, completed } = data;

        if (!isValid(taskId)) {
            res.status(400).send({ status: false, msg: "TaskId not found" });
            return
        }
        if (!isValidObjectId(taskId)) {
            res.status(404).send({ status: false, msg: "Invalid TaskId" });
            return
        }
        if (!isValid(description)) {
            res.status(400).send({ status: false, msg: "Description required" });
            return
        }
        if (!isValid(completed)) {
            res.status(400).send({ status: false, msg: "completed required" });
            return
        }

        let taskData = await taskModel.find({ _id: taskId }).select({ _id: 1, description: 1, completed: 1 }).sort({ description: 1 });
        if (!isValid(taskData)) {
            res.status(400).send({ status: false, msg: "There is no task with this taskId" });
            return
        } else {
            res.status(200).send({ status: true, msg: "Congratulations", data: taskData });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// --------------------------------------------------------------------------------------- //
// Update Task

const updateTask = async function(req, res) {
    try {
        let data = req.body;
        let { description, completed } = data;
        let taskId = req.params.taskId;

        let filter = {};

        if (!isValid(taskId)) {
            res.status(400).send({ status: false, msg: "TaskId not found" });
            return
        }
        if (!isValidObjectId(taskId)) {
            res.status(404).send({ status: false, msg: "Invalid TaskId" });
            return
        }
        // Autherization
        if (userId != req.owner.userId) {
            res.status(403).send({ status: false, message: "User not authorized" });
            return
        }
        if (!isValid(data)) {
            res.status(400).send({ status: false, msg: "Please provide input via body" });
            return
        }
        if (isValid(description)) {
            filter["description"] = description;
        }
        if (isValid(completed)) {
            filter["completed"] = completed;
        }
        else {
            let updatedData = await taskModel.findOneAndUpdate({ _id: taskId, owner: req.userId}, { $set: filter }, {new: true });
            res.status(200).send({ status: false, msg: "Successfully Updated!", data: updatedData });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ----------------------------------------------------------------------------------------- //
// Delete Task

const deleteTask = async function(req, res) {
    try {
        let data = req.body;
        let taskId = req.params.taskId;

        if (!isValid(taskId)) {
            res.status(400).send({ status: false, msg: "taskId is required" });
            return
        }
        if (!isValidObjectId(taskId)) {
            res.status(400).send({ status: false, msg: "Invalid taskId" });
            return
        }
        // Autherization
        if (userId != req.owner.userId) {
            res.status(403).send({ status: false, message: "User not authorized" });
            return
        }
        let deletedData = await taskModel.findOneAndDelete({ _id: taskId, owner: req.userId }, { new: true });
        if (!isValid(deletedData)) {
            res.status(404).send({ status: false, msg: "Task not found" });
            return
        } else {
            res.status(200).send({ status: true, msg: "Task deleted successfully" });
            return
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
        return
    }
};

// ---------------------------------------------------------------------------------------- //

module.exports.createTask = createTask;
module.exports.getTask = getTask;
module.exports.getTaskQuery = getTaskQuery;
module.exports.updateTask = updateTask;
module.exports.deleteTask = deleteTask;