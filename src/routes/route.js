const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const taskController = require("../controllers/taskController");
const middleware = require("../middleware/midd");
const email = require("../email/account");

// ---------------------------------------------------------------------------------------- //
// User API's

router.post("/user", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/user/:userId", middleware.auth, userController.getUser);
router.get("/user", middleware.auth, userController.getUserQuery);
router.put("/user/:userId", middleware.auth, userController.updateUser);
router.delete("/user/:userId", middleware.auth, userController.deleteUser);

// ---------------------------------------------------------------------------------------- //
// Task API's

router.post("/task", middleware.auth, taskController.createTask);
router.get("/task/:taskId", middleware.auth, taskController.getTask);
router.get("/task", middleware.auth, taskController.getTaskQuery);
router.put("/task/:taskId", middleware.auth, taskController.updateTask);
router.delete("/task/:taskId", middleware.auth, taskController.deleteTask);

// ---------------------------------------------------------------------------------------- //

module.exports = router;