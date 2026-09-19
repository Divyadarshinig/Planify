const Task = require("../models/Task");


// =========================================================
// 📊 GET PRODUCTIVITY ANALYSIS
// =========================================================

const getProductivityStats = async (req, res) => {

    try {

        const userId = req.user.userId;


        // =====================================================
        // GET ALL USER TASKS
        // =====================================================

        const tasks = await Task.find({
            user: userId
        });


        // =====================================================
        // BASIC STATISTICS
        // =====================================================

        const totalTasks =
            tasks.length;


        const completedTasks =
            tasks.filter(
                task =>
                    task.status === "completed"
            );


        const completedCount =
            completedTasks.length;


        const pendingCount =
            tasks.filter(
                task =>
                    task.status === "pending"
            ).length;


        const inProgressCount =
            tasks.filter(
                task =>
                    task.status === "in-progress"
            ).length;


        // =====================================================
        // COMPLETION PERCENTAGE
        // =====================================================

        const completionPercentage =
            totalTasks === 0
                ? 0
                : Math.round(
                    (completedCount /
                        totalTasks) *
                    100
                );


        // =====================================================
        // TODAY'S COMPLETED TASKS
        // =====================================================

        const today =
            new Date();

        const todayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );


        const tomorrowStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1
            );


        const completedToday =
            completedTasks.filter(task => {

                if (!task.completedAt) {
                    return false;
                }

                const completedDate =
                    new Date(
                        task.completedAt
                    );

                return (
                    completedDate >=
                        todayStart &&
                    completedDate <
                        tomorrowStart
                );

            }).length;


        // =====================================================
        // THIS WEEK'S COMPLETED TASKS
        // =====================================================

        const dayOfWeek =
            today.getDay();


        const mondayOffset =
            dayOfWeek === 0
                ? 6
                : dayOfWeek - 1;


        const weekStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() -
                    mondayOffset
            );


        weekStart.setHours(
            0,
            0,
            0,
            0
        );


        const completedThisWeek =
            completedTasks.filter(task => {

                if (!task.completedAt) {
                    return false;
                }

                const completedDate =
                    new Date(
                        task.completedAt
                    );

                return (
                    completedDate >=
                    weekStart
                );

            }).length;


        // =====================================================
        // 🔥 CURRENT STREAK
        // =====================================================

        const completionDates =
            completedTasks
                .filter(
                    task =>
                        task.completedAt
                )
                .map(task => {

                    const date =
                        new Date(
                            task.completedAt
                        );

                    return getDateKey(
                        date
                    );

                });


        // Remove duplicate dates

        const uniqueDates =
            [...new Set(
                completionDates
            )];


        // Sort newest → oldest

        uniqueDates.sort(
            (a, b) =>
                new Date(b) -
                new Date(a)
        );


        const currentStreak =
            calculateCurrentStreak(
                uniqueDates
            );


        // =====================================================
        // 🏆 LONGEST STREAK
        // =====================================================

        const longestStreak =
            calculateLongestStreak(
                uniqueDates
            );


        // =====================================================
        // PRODUCTIVITY MESSAGE
        // =====================================================

        let productivityMessage;


        if (totalTasks === 0) {

            productivityMessage =
                "Start by creating your first task.";

        } else if (
            completionPercentage === 100
        ) {

            productivityMessage =
                "Amazing! You completed everything.";

        } else if (
            completionPercentage >= 75
        ) {

            productivityMessage =
                "Excellent progress! Keep going.";

        } else if (
            completionPercentage >= 50
        ) {

            productivityMessage =
                "You're making good progress.";

        } else if (
            completionPercentage >= 25
        ) {

            productivityMessage =
                "Good start. Keep building momentum.";

        } else {

            productivityMessage =
                "Every completed task moves you forward.";

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({

            totalTasks,

            completedTasks:
                completedCount,

            pendingTasks:
                pendingCount,

            inProgressTasks:
                inProgressCount,

            completionPercentage,

            completedToday,

            completedThisWeek,

            currentStreak,

            longestStreak,

            productivityMessage

        });


    } catch (error) {

        console.error(
            "Productivity error:",
            error
        );


        res.status(500).json({

            message:
                "Unable to calculate productivity statistics",

            error:
                error.message

        });

    }

};



// =========================================================
// 📅 DATE KEY
// =========================================================

function getDateKey(date) {

    return `${date.getFullYear()}-${
        String(
            date.getMonth() + 1
        ).padStart(2, "0")
    }-${
        String(
            date.getDate()
        ).padStart(2, "0")
    }`;

}



// =========================================================
// 🔥 CURRENT STREAK CALCULATOR
// =========================================================

function calculateCurrentStreak(
    dates
) {

    if (!dates.length) {
        return 0;
    }


    const today =
        new Date();


    const todayKey =
        getDateKey(today);


    const yesterday =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 1
        );


    const yesterdayKey =
        getDateKey(
            yesterday
        );


    // A streak can continue if the
    // user completed a task today
    // OR yesterday.

    if (
        dates[0] !== todayKey &&
        dates[0] !== yesterdayKey
    ) {

        return 0;

    }


    let streak = 1;


    let currentDate =
        new Date(
            dates[0]
        );


    for (
        let i = 1;
        i < dates.length;
        i++
    ) {

        const previousDate =
            new Date(
                currentDate
            );


        previousDate.setDate(
            previousDate.getDate() - 1
        );


        const expectedKey =
            getDateKey(
                previousDate
            );


        if (
            dates[i] === expectedKey
        ) {

            streak++;

            currentDate =
                previousDate;

        } else {

            break;

        }

    }


    return streak;

}



// =========================================================
// 🏆 LONGEST STREAK CALCULATOR
// =========================================================

function calculateLongestStreak(
    dates
) {

    if (!dates.length) {
        return 0;
    }


    // Sort oldest → newest

    const sortedDates =
        [...dates].sort(
            (a, b) =>
                new Date(a) -
                new Date(b)
        );


    let longest = 1;

    let current = 1;


    for (
        let i = 1;
        i < sortedDates.length;
        i++
    ) {

        const previousDate =
            new Date(
                sortedDates[i - 1]
            );


        previousDate.setDate(
            previousDate.getDate() + 1
        );


        const expectedKey =
            getDateKey(
                previousDate
            );


        if (
            sortedDates[i] ===
            expectedKey
        ) {

            current++;

            longest =
                Math.max(
                    longest,
                    current
                );

        } else {

            current = 1;

        }

    }


    return longest;

}



// =========================================================
// EXPORT
// =========================================================

module.exports = {
    getProductivityStats
};