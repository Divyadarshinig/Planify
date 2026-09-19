// =========================================================
// PLANIFY - FRONTEND SCRIPT
// =========================================================

const API_URL = "https://planify-bwxy.onrender.com/api";


// =========================================================
// ELEMENTS
// =========================================================

const taskForm =
    document.getElementById("taskForm");

const taskFormContainer =
    document.getElementById("taskFormContainer");

const addTaskButton =
    document.getElementById("addTaskButton");

const cancelTaskButton =
    document.getElementById("cancelTaskButton");

const taskList =
    document.getElementById("taskList");

const logoutButton =
    document.getElementById("logoutButton");

const taskTitle =
    document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskStatus =
    document.getElementById("taskStatus");

const taskPriority =
    document.getElementById("taskPriority");

const taskEnergy =
    document.getElementById("taskEnergy");

const taskReminder =
    document.getElementById("taskReminder");

const taskSubmitButton =
    document.getElementById("taskSubmitButton");

const userName =
    document.getElementById("userName");

const currentDate =
    document.getElementById("currentDate");

const totalTasksElement =
    document.getElementById("totalTasks");

const pendingTasksElement =
    document.getElementById("pendingTasks");

const progressTasksElement =
    document.getElementById("progressTasks");

const completedTasksElement =
    document.getElementById("completedTasks");


// =========================================================
// PRODUCTIVITY ELEMENTS
// =========================================================

const completionPercentageElement =
    document.getElementById("completionPercentage");

const completedTodayElement =
    document.getElementById("completedToday");

const completedThisWeekElement =
    document.getElementById("completedThisWeek");

const currentStreakElement =
    document.getElementById("currentStreak");

const longestStreakElement =
    document.getElementById("longestStreak");

const productivityMessageElement =
    document.getElementById("productivityMessage");

const focusTaskContainer =
    document.getElementById("focusTaskContainer");


// =========================================================
// LOGIN / REGISTER
// =========================================================

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");

const loginSection =
    document.getElementById("loginSection");

const registerSection =
    document.getElementById("registerSection");


// =========================================================
// LOGIN / REGISTER SWITCH
// =========================================================

if (showRegister) {

    showRegister.addEventListener("click", function (event) {

        event.preventDefault();

        if (loginSection) {
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.style.display = "block";
        }

    });

}


if (showLogin) {

    showLogin.addEventListener("click", function (event) {

        event.preventDefault();

        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (loginSection) {
            loginSection.style.display = "block";
        }

    });

}


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let currentTasks = [];

let editingTaskId = null;

const reminderTimers = new Map();


// =========================================================
// TOKEN
// =========================================================

const token =
    localStorage.getItem("token");


// =========================================================
// CHECK LOGIN
// =========================================================

if (taskList && !token) {

    window.location.href = "index.html";

}


// =========================================================
// DISPLAY USER
// =========================================================

if (userName) {

    const storedUser =
        localStorage.getItem("user");

    if (storedUser) {

        try {

            const user =
                JSON.parse(storedUser);

            userName.textContent =
                user.name || "User";

        } catch (error) {

            console.error(
                "Unable to read user:",
                error
            );

        }

    }

}


// =========================================================
// CURRENT DATE
// =========================================================

if (currentDate) {

    const today =
        new Date();

    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


// =========================================================
// LOGIN
// =========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const emailInput =
                document.getElementById("loginEmail") ||
                document.getElementById("email");

            const passwordInput =
                document.getElementById("loginPassword") ||
                document.getElementById("password");

            if (!emailInput || !passwordInput) {

                alert(
                    "Login fields could not be found."
                );

                return;
            }

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                localStorage.setItem(
                    "token",
                    data.token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Unable to connect to Planify server."
                );

            }

        }
    );

}


// =========================================================
// REGISTER
// =========================================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById(
                    "registerName"
                );

            const emailInput =
                document.getElementById(
                    "registerEmail"
                );

            const passwordInput =
                document.getElementById(
                    "registerPassword"
                );

            const confirmPasswordInput =
                document.getElementById(
                    "confirmPassword"
                );


            if (
                !nameInput ||
                !emailInput ||
                !passwordInput
            ) {

                alert(
                    "Registration fields could not be found."
                );

                return;
            }


            const name =
                nameInput.value.trim();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : password;


            if (!name || !email || !password) {

                alert(
                    "Please fill in all required fields."
                );

                return;
            }


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;
                }


                alert(
                    "Registration successful! Please login."
                );


                registerForm.reset();


                if (registerSection) {
                    registerSection.style.display =
                        "none";
                }


                if (loginSection) {
                    loginSection.style.display =
                        "block";
                }


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Unable to connect to Planify server."
                );

            }

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "index.html";

        }
    );

}


// =========================================================
// ADD TASK BUTTON
// =========================================================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        function () {

            editingTaskId = null;

            if (taskForm) {
                taskForm.reset();
            }

            if (taskSubmitButton) {

                taskSubmitButton.textContent =
                    "Add Task";

            }

            if (taskFormContainer) {

                taskFormContainer.style.display =
                    "block";

            }

        }
    );

}


// =========================================================
// CANCEL TASK
// =========================================================

if (cancelTaskButton) {

    cancelTaskButton.addEventListener(
        "click",
        function () {

            editingTaskId = null;

            if (taskForm) {
                taskForm.reset();
            }

            if (taskFormContainer) {

                taskFormContainer.style.display =
                    "none";

            }

        }
    );

}


// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {

    if (!taskList || !token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "index.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to load tasks."
            );

            return;
        }


        currentTasks =
            Array.isArray(data)
                ? data
                : data.tasks || [];


        renderTasks();

        updateStatistics();

        updateFocusTask();

        setupReminders();


    } catch (error) {

        console.error(
            "Load tasks error:",
            error
        );

        alert(
            "Unable to connect to Planify server."
        );

    }

}


// =========================================================
// CREATE / UPDATE TASK
// =========================================================

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!token) {

                window.location.href =
                    "index.html";

                return;
            }


            const title =
                taskTitle
                    ? taskTitle.value.trim()
                    : "";


            const description =
                taskDescription
                    ? taskDescription.value.trim()
                    : "";


            const status =
                taskStatus
                    ? taskStatus.value
                    : "pending";


            const priority =
                taskPriority
                    ? taskPriority.value
                    : "medium";


            const energyLevel =
                taskEnergy
                    ? taskEnergy.value
                    : "medium";


            const reminder =
                taskReminder
                    ? taskReminder.value
                    : "";


            if (!title) {

                alert(
                    "Please enter a task title."
                );

                return;
            }


            const taskData = {

                title: title,

                description: description,

                status: status,

                priority: priority,

                energyLevel: energyLevel,

                reminder:
                    reminder
                        ? new Date(reminder).toISOString()
                        : null

            };


            try {

                let response;


                if (editingTaskId) {

                    response =
                        await fetch(
                            `${API_URL}/tasks/${editingTaskId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify(
                                        taskData
                                    )
                            }
                        );

                } else {

                    response =
                        await fetch(
                            `${API_URL}/tasks`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify(
                                        taskData
                                    )
                            }
                        );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to save task."
                    );

                    return;
                }


                editingTaskId = null;


                taskForm.reset();


                if (taskFormContainer) {

                    taskFormContainer.style.display =
                        "none";

                }


                if (taskSubmitButton) {

                    taskSubmitButton.textContent =
                        "Add Task";

                }


                await loadTasks();


            } catch (error) {

                console.error(
                    "Save task error:",
                    error
                );

                alert(
                    "Unable to connect to Planify server."
                );

            }

        }
    );

}


// =========================================================
// RENDER TASKS
// =========================================================

function renderTasks() {

    if (!taskList) {
        return;
    }


    if (!currentTasks.length) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div>
                    📝
                </div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Create your first task and start planning your day.
                </p>

            </div>

        `;

        return;
    }


    taskList.innerHTML =
        currentTasks
            .map(function (task) {

                const completed =
                    task.status === "completed";


                const reminderText =
                    task.reminder
                        ? formatDateTime(
                            task.reminder
                        )
                        : "";


                return `

                    <div class="task-card ${completed ? "completed" : ""}">

                        <div class="task-card-header">

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        task.title || ""
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        task.description || ""
                                    )}
                                </p>

                            </div>

                            <span class="task-priority ${escapeHtml(
                                task.priority || "medium"
                            )}">

                                ${escapeHtml(
                                    task.priority || "medium"
                                )}

                            </span>

                        </div>


                        <div class="task-meta">

                            <span>
                                ⚡
                                ${escapeHtml(
                                    task.energyLevel || "medium"
                                )}
                            </span>

                            <span>
                                📌
                                ${escapeHtml(
                                    task.status || "pending"
                                )}
                            </span>

                            ${
                                reminderText
                                    ? `
                                        <span>
                                            ⏰ ${reminderText}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        <div class="task-actions">

                            <button
                                type="button"
                                onclick="toggleTaskCompletion(
                                    '${task._id}',
                                    ${completed}
                                )"
                            >
                                ${
                                    completed
                                        ? "↩ Mark Pending"
                                        : "✓ Complete"
                                }
                            </button>


                            <button
                                type="button"
                                onclick="editTask(
                                    '${task._id}'
                                )"
                            >
                                ✏ Edit
                            </button>


                            <button
                                type="button"
                                onclick="deleteTask(
                                    '${task._id}'
                                )"
                            >
                                🗑 Delete
                            </button>


                            ${
                                task.isFocus
                                    ? `
                                        <button
                                            type="button"
                                            onclick="removeFocus(
                                                '${task._id}'
                                            )"
                                        >
                                            ⭐ Remove Focus
                                        </button>
                                      `
                                    : `
                                        <button
                                            type="button"
                                            onclick="setFocus(
                                                '${task._id}'
                                            )"
                                        >
                                            ☆ Set Focus
                                        </button>
                                      `
                            }

                        </div>

                    </div>

                `;

            })
            .join("");

}


// =========================================================
// EDIT TASK
// =========================================================

function editTask(taskId) {

    const task =
        currentTasks.find(
            function (item) {

                return item._id === taskId;

            }
        );


    if (!task) {
        return;
    }


    editingTaskId =
        taskId;


    if (taskTitle) {

        taskTitle.value =
            task.title || "";

    }


    if (taskDescription) {

        taskDescription.value =
            task.description || "";

    }


    if (taskStatus) {

        taskStatus.value =
            task.status || "pending";

    }


    if (taskPriority) {

        taskPriority.value =
            task.priority || "medium";

    }


    if (taskEnergy) {

        taskEnergy.value =
            task.energyLevel || "medium";

    }


    if (taskReminder) {

        if (task.reminder) {

            const date =
                new Date(task.reminder);

            const localDate =
                new Date(
                    date.getTime() -
                    date.getTimezoneOffset() * 60000
                );

            taskReminder.value =
                localDate
                    .toISOString()
                    .slice(0, 16);

        } else {

            taskReminder.value = "";

        }

    }


    if (taskSubmitButton) {

        taskSubmitButton.textContent =
            "Update Task";

    }


    if (taskFormContainer) {

        taskFormContainer.style.display =
            "block";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =========================================================
// DELETE TASK
// =========================================================

async function deleteTask(taskId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete task."
            );

            return;
        }


        await loadTasks();


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        alert(
            "Unable to connect to Planify server."
        );

    }

}


// =========================================================
// TOGGLE COMPLETION
// =========================================================

async function toggleTaskCompletion(
    taskId,
    isCompleted
) {

    const newStatus =
        isCompleted
            ? "pending"
            : "completed";


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            status: newStatus
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update task."
            );

            return;
        }


        await loadTasks();


    } catch (error) {

        console.error(
            "Toggle completion error:",
            error
        );

        alert(
            "Unable to connect to Planify server."
        );

    }

}


// =========================================================
// SET FOCUS
// =========================================================

async function setFocus(taskId) {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            isFocus: true
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to set focus."
            );

            return;
        }


        await loadTasks();


    } catch (error) {

        console.error(
            "Set focus error:",
            error
        );

        alert(
            "Unable to connect to Planify server."
        );

    }

}


// =========================================================
// REMOVE FOCUS
// =========================================================

async function removeFocus(taskId) {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            isFocus: false
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to remove focus."
            );

            return;
        }


        await loadTasks();


    } catch (error) {

        console.error(
            "Remove focus error:",
            error
        );

        alert(
            "Unable to connect to Planify server."
        );

    }

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics() {

    const total =
        currentTasks.length;


    const pending =
        currentTasks.filter(
            function (task) {

                return task.status === "pending";

            }
        ).length;


    const progress =
        currentTasks.filter(
            function (task) {

                return (
                    task.status ===
                    "in-progress"
                );

            }
        ).length;


    const completed =
        currentTasks.filter(
            function (task) {

                return task.status === "completed";

            }
        ).length;


    if (totalTasksElement) {

        totalTasksElement.textContent =
            total;

    }


    if (pendingTasksElement) {

        pendingTasksElement.textContent =
            pending;

    }


    if (progressTasksElement) {

        progressTasksElement.textContent =
            progress;

    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completed;

    }


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    if (completionPercentageElement) {

        completionPercentageElement.textContent =
            `${percentage}%`;

    }


    updateProductivityStats();

}


// =========================================================
// PRODUCTIVITY STATISTICS
// =========================================================

function updateProductivityStats() {

    const completedTasks =
        currentTasks.filter(
            function (task) {

                return task.status === "completed";

            }
        );


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const completedToday =
        completedTasks.filter(
            function (task) {

                const date =
                    new Date(
                        task.updatedAt ||
                        task.completedAt ||
                        task.createdAt
                    );

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    date.getTime() ===
                    today.getTime()
                );

            }
        ).length;


    if (completedTodayElement) {

        completedTodayElement.textContent =
            completedToday;

    }


    const weekStart =
        new Date(today);

    weekStart.setDate(
        today.getDate() -
        today.getDay()
    );


    const completedThisWeek =
        completedTasks.filter(
            function (task) {

                const date =
                    new Date(
                        task.updatedAt ||
                        task.completedAt ||
                        task.createdAt
                    );

                return date >= weekStart;

            }
        ).length;


    if (completedThisWeekElement) {

        completedThisWeekElement.textContent =
            completedThisWeek;

    }


    const streak =
        calculateCurrentStreak(
            completedTasks
        );


    const longest =
        calculateLongestStreak(
            completedTasks
        );


    if (currentStreakElement) {

        currentStreakElement.textContent =
            streak;

    }


    if (longestStreakElement) {

        longestStreakElement.textContent =
            longest;

    }


    if (productivityMessageElement) {

        if (completedTasks.length === 0) {

            productivityMessageElement.textContent =
                "Start completing tasks to build your productivity streak.";

        } else if (streak > 0) {

            productivityMessageElement.textContent =
                "Great work! Keep your productivity streak going.";

        } else {

            productivityMessageElement.textContent =
                "You have completed tasks before. Start a new streak today.";

        }

    }

}


// =========================================================
// CURRENT STREAK
// =========================================================

function calculateCurrentStreak(tasks) {

    if (!tasks.length) {
        return 0;
    }


    const dates =
        getCompletedDates(tasks);


    let streak = 0;


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    let current =
        new Date(today);


    while (
        dates.has(
            dateKey(current)
        )
    ) {

        streak++;

        current.setDate(
            current.getDate() - 1
        );

    }


    return streak;

}


// =========================================================
// LONGEST STREAK
// =========================================================

function calculateLongestStreak(tasks) {

    const dates =
        Array.from(
            getCompletedDates(tasks)
        ).sort();


    if (!dates.length) {
        return 0;
    }


    let longest = 1;

    let current = 1;


    for (
        let i = 1;
        i < dates.length;
        i++
    ) {

        const previous =
            new Date(
                dates[i - 1]
            );

        const currentDateValue =
            new Date(
                dates[i]
            );


        const difference =
            (
                currentDateValue -
                previous
            ) /
            (
                1000 *
                60 *
                60 *
                24
            );


        if (difference === 1) {

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
// COMPLETED DATES
// =========================================================

function getCompletedDates(tasks) {

    const dates =
        new Set();


    tasks.forEach(
        function (task) {

            const date =
                new Date(
                    task.updatedAt ||
                    task.completedAt ||
                    task.createdAt
                );


            dates.add(
                dateKey(date)
            );

        }
    );


    return dates;

}


// =========================================================
// DATE KEY
// =========================================================

function dateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// =========================================================
// FOCUS TASK
// =========================================================

function updateFocusTask() {

    if (!focusTaskContainer) {
        return;
    }


    const focusTask =
        currentTasks.find(
            function (task) {

                return task.isFocus === true;

            }
        );


    if (!focusTask) {

        focusTaskContainer.innerHTML = `

            <div class="focus-empty">

                <div class="focus-empty-icon">
                    ⭐
                </div>

                <div>

                    <h3>
                        No focus task yet
                    </h3>

                    <p>
                        Choose one task as your focus for today.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    focusTaskContainer.innerHTML = `

        <div class="focus-task">

            <h3>
                ${escapeHtml(
                    focusTask.title || ""
                )}
            </h3>

            <p>
                ${escapeHtml(
                    focusTask.description || ""
                )}
            </p>

            <button
                type="button"
                onclick="removeFocus(
                    '${focusTask._id}'
                )"
            >
                Remove Focus
            </button>

        </div>

    `;

}


// =========================================================
// REMINDERS
// =========================================================

function setupReminders() {

    reminderTimers.forEach(
        function (timer) {

            clearTimeout(timer);

        }
    );


    reminderTimers.clear();


    currentTasks.forEach(
        function (task) {

            if (!task.reminder) {
                return;
            }


            if (task.status === "completed") {
                return;
            }


            const reminderTime =
                new Date(
                    task.reminder
                ).getTime();


            const delay =
                reminderTime -
                Date.now();


            if (delay <= 0) {
                return;
            }


            const timer =
                setTimeout(
                    function () {

                        showReminder(
                            task
                        );

                    },
                    Math.min(
                        delay,
                        2147483647
                    )
                );


            reminderTimers.set(
                task._id,
                timer
            );

        }
    );

}


// =========================================================
// SHOW REMINDER
// =========================================================

function showReminder(task) {

    alert(
        `⏰ Reminder\n\n${task.title}`
    );


    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "Planify Reminder",
            {
                body:
                    task.title
            }
        );

    }

}


// =========================================================
// REQUEST NOTIFICATION PERMISSION
// =========================================================

if (
    "Notification" in window &&
    Notification.permission === "default"
) {

    Notification.requestPermission()
        .catch(
            function (error) {

                console.error(
                    error
                );

            }
        );

}


// =========================================================
// FORMAT DATE / TIME
// =========================================================

function formatDateTime(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// INITIAL LOAD
// =========================================================

if (taskList && token) {

    loadTasks();

}


// =========================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================================

window.editTask =
    editTask;

window.deleteTask =
    deleteTask;

window.toggleTaskCompletion =
    toggleTaskCompletion;

window.setFocus =
    setFocus;

window.removeFocus =
    removeFocus;