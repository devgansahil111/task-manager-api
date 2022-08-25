const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

// ---------------------------------------------------------------------------------------- //

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: ObjectId,
        required: true,
        ref: "User"
    }
}, { timestamps: true });

// ---------------------------------------------------------------------------------------- //

module.exports = mongoose.model("Task", taskSchema);