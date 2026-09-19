const Task = require("../models/Task");


// =========================================================
// CREATE TASK
// =========================================================

const createTask = async (req, res) => {

    try {

        const {
            title,
            description,
            status,
            priority,
            energyLevel,
            dueDate,
            reminder,
            isFocus
        } = req.body;


        if (!title) {

            return res.status(400).json({
                message: "Task title is required"
            });

        }


        // If this task is selected as Focus,
        // remove Focus from all other tasks.

        if (isFocus === true) {

            await Task.updateMany(
                {
                    user: req.user.userId
                },
                {
                    $set: {
                        isFocus: false
                    }
                }
            );

        }


        // If a task is created as completed,
        // record the completion date.

        const completedAt =
            status === "completed"
                ? new Date()
                : null;


        const task = await Task.create({

            title,

            description,

            status,

            priority,

            energyLevel:
                energyLevel || "medium",

            dueDate,

            reminder:
                reminder || null,

            isFocus:
                isFocus || false,

            completedAt,

            user:
                req.user.userId

        });


        res.status(201).json({

            message:
                "Task created successfully",

            task

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};



// =========================================================
// GET TASKS
// =========================================================

const getTasks = async (req, res) => {

    try {

        const tasks =
            await Task.find({

                user:
                    req.user.userId

            }).sort({

                createdAt: -1

            });


        res.status(200).json({

            tasks

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};



// =========================================================
// UPDATE TASK
// =========================================================

const updateTask = async (req, res) => {

    try {

        const { id } =
            req.params;


        // =====================================================
        // GET EXISTING TASK
        // =====================================================

        const existingTask =
            await Task.findOne({

                _id: id,

                user:
                    req.user.userId

            });


        if (!existingTask) {

            return res.status(404).json({

                message:
                    "Task not found"

            });

        }


        // =====================================================
        // FOCUS HANDLING
        // =====================================================

        if (req.body.isFocus === true) {

            await Task.updateMany(

                {
                    user:
                        req.user.userId,

                    _id: {
                        $ne: id
                    }
                },

                {
                    $set: {
                        isFocus: false
                    }
                }

            );

        }


        // =====================================================
        // COMPLETION DATE HANDLING
        // =====================================================

        let updateData = {
            ...req.body
        };


        // Task is being marked completed
        // for the first time.

        if (
            req.body.status === "completed" &&
            existingTask.status !== "completed"
        ) {

            updateData.completedAt =
                new Date();

        }


        // Task is being moved back from completed
        // to pending or in-progress.

        if (
            req.body.status &&
            req.body.status !== "completed"
        ) {

            updateData.completedAt =
                null;

        }


        // =====================================================
        // UPDATE TASK
        // =====================================================

        const task =
            await Task.findOneAndUpdate(

                {
                    _id: id,

                    user:
                        req.user.userId
                },

                updateData,

                {
                    new: true,

                    runValidators: true
                }

            );


        if (!task) {

            return res.status(404).json({

                message:
                    "Task not found"

            });

        }


        res.status(200).json({

            message:
                "Task updated successfully",

            task

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};



// =========================================================
// DELETE TASK
// =========================================================

const deleteTask = async (req, res) => {

    try {

        const { id } =
            req.params;


        const task =
            await Task.findOneAndDelete({

                _id: id,

                user:
                    req.user.userId

            });


        if (!task) {

            return res.status(404).json({

                message:
                    "Task not found"

            });

        }


        res.status(200).json({

            message:
                "Task deleted successfully"

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};



module.exports = {

    createTask,

    getTasks,

    updateTask,

    deleteTask

};