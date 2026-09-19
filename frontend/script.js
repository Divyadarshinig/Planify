// =========================================================
// PLANIFY - FRONTEND SCRIPT
// =========================================================

const API_URL = "http://localhost:5000/api";

// =========================================================
// ELEMENTS
// =========================================================

const taskForm = document.getElementById("taskForm");
const taskFormContainer = document.getElementById("taskFormContainer");
const addTaskButton = document.getElementById("addTaskButton");
const cancelTaskButton = document.getElementById("cancelTaskButton");

const taskList = document.getElementById("taskList");
const logoutButton = document.getElementById("logoutButton");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskStatus = document.getElementById("taskStatus");
const taskPriority = document.getElementById("taskPriority");
const taskEnergy = document.getElementById("taskEnergy");
const taskReminder = document.getElementById("taskReminder");
const taskSubmitButton = document.getElementById("taskSubmitButton");

const userName = document.getElementById("userName");
const currentDate = document.getElementById("currentDate");

const totalTasksElement = document.getElementById("totalTasks");
const pendingTasksElement = document.getElementById("pendingTasks");
const progressTasksElement = document.getElementById("progressTasks");
const completedTasksElement = document.getElementById("completedTasks");

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

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

// =========================================================
// GLOBAL VARIABLES
// =========================================================

let currentTasks = [];
let editingTaskId = null;

const reminderTimers = new Map();

const token = localStorage.getItem("token");

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
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            userName.textContent = user.name || "User";
        } catch (error) {
            console.error("Unable to read stored user:", error);
        }
    }
}

// =========================================================
// CURRENT DATE
// =========================================================

if (currentDate) {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// =========================================================
// LOGIN
// =========================================================

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        /*
         * Supports both:
         * id="email" / id="password"
         * and
         * id="loginEmail" / id="loginPassword"
         */

        const emailInput =
            document.getElementById("loginEmail") ||
            document.getElementById("email");

        const passwordInput =
            document.getElementById("loginPassword") ||
            document.getElementById("password");

        if (!emailInput || !passwordInput) {
            alert("Login fields could not be found.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);

            alert(
                "Unable to connect to Planify server. " +
                "Make sure the backend is running."
            );
        }
    });
}

// =========================================================
// REGISTER
// =========================================================

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput =
            document.getElementById("registerName");

        const emailInput =
            document.getElementById("registerEmail");

        const passwordInput =
            document.getElementById("registerPassword");

        if (!nameInput || !emailInput || !passwordInput) {
            alert("Registration fields could not be found.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!name || !email || !password) {
            alert("Please fill in all registration fields.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

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

            window.location.href = "index.html";

        } catch (error) {
            console.error("Registration error:", error);

            alert(
                "Unable to connect to Planify server."
            );
        }
    });
}

// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        clearReminderTimers();

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    });
}

// =========================================================
// ADD TASK
// =========================================================

if (addTaskButton) {
    addTaskButton.addEventListener("click", () => {
        editingTaskId = null;

        taskForm.reset();

        taskStatus.value = "pending";
        taskPriority.value = "medium";
        taskEnergy.value = "medium";

        taskSubmitButton.textContent = "Create Task";

        taskFormContainer.style.display = "block";

        taskFormContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

// =========================================================
// CANCEL TASK
// =========================================================

if (cancelTaskButton) {
    cancelTaskButton.addEventListener("click", () => {
        editingTaskId = null;

        taskForm.reset();

        taskStatus.value = "pending";
        taskPriority.value = "medium";
        taskEnergy.value = "medium";

        taskSubmitButton.textContent = "Create Task";

        taskFormContainer.style.display = "none";
    });
}

// =========================================================
// CREATE / UPDATE TASK
// =========================================================

if (taskForm) {
    taskForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = taskTitle.value.trim();
        const description = taskDescription.value.trim();
        const status = taskStatus.value;
        const priority = taskPriority.value;
        const energyLevel = taskEnergy.value || "medium";

        let reminderValue = null;

        if (taskReminder.value) {
            const reminderDate =
                new Date(taskReminder.value);

            if (isNaN(reminderDate.getTime())) {
                alert("Please select a valid reminder date and time.");
                return;
            }

            reminderValue =
                reminderDate.toISOString();
        }

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const wasEditing = Boolean(editingTaskId);

        const taskData = {
            title,
            description,
            status,
            priority,
            energyLevel,
            reminder: reminderValue
        };

        try {
            let response;

            if (editingTaskId) {
                response = await fetch(
                    `${API_URL}/tasks/${editingTaskId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(taskData)
                    }
                );
            } else {
                response = await fetch(
                    `${API_URL}/tasks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(taskData)
                    }
                );
            }

            const data = await response.json();

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to save task."
                );
                return;
            }

            // =================================================
            // REQUEST BROWSER NOTIFICATION PERMISSION
            // =================================================

            if (reminderValue) {
                await requestNotificationPermission();
            }

            editingTaskId = null;

            taskForm.reset();

            taskStatus.value = "pending";
            taskPriority.value = "medium";
            taskEnergy.value = "medium";

            taskSubmitButton.textContent = "Create Task";

            taskFormContainer.style.display = "none";

            await loadTasks();

            alert(
                wasEditing
                    ? "Task updated successfully!"
                    : "Task created successfully!"
            );

        } catch (error) {
            console.error("Task save error:", error);

            alert(
                "Unable to connect to Planify server."
            );
        }
    });
}

// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {
    if (!token || !taskList) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Unable to load tasks."
            );
            return;
        }

        currentTasks = data.tasks || [];

        displayTasks(currentTasks);
        updateStatistics(currentTasks);
        displayFocusTask();

        scheduleAllReminders();

        await loadProductivityStats();

    } catch (error) {
        console.error(
            "Error loading tasks:",
            error
        );
    }
}

// =========================================================
// PRODUCTIVITY ANALYSIS
// =========================================================

async function loadProductivityStats() {
    if (!token) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/productivity`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Productivity API error:",
                data.message
            );
            return;
        }

        if (completionPercentageElement) {
            completionPercentageElement.textContent =
                `${data.completionPercentage || 0}%`;
        }

        if (completedTodayElement) {
            completedTodayElement.textContent =
                data.completedToday || 0;
        }

        if (completedThisWeekElement) {
            completedThisWeekElement.textContent =
                data.completedThisWeek || 0;
        }

        if (currentStreakElement) {
            const streak =
                data.currentStreak || 0;

            currentStreakElement.textContent =
                `${streak} ${streak === 1 ? "day" : "days"}`;
        }

        if (longestStreakElement) {
            const streak =
                data.longestStreak || 0;

            longestStreakElement.textContent =
                `${streak} ${streak === 1 ? "day" : "days"}`;
        }

        if (productivityMessageElement) {
            productivityMessageElement.textContent =
                data.productivityMessage ||
                "Keep moving forward.";
        }

    } catch (error) {
        console.error(
            "Error loading productivity statistics:",
            error
        );
    }
}

// =========================================================
// DISPLAY TASKS
// =========================================================

function displayTasks(tasks) {
    if (!taskList) {
        return;
    }

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    🌙
                </div>

                <h3>No tasks yet</h3>

                <p>
                    Create your first task and
                    start planning your day.
                </p>
            </div>
        `;

        return;
    }

    taskList.innerHTML = tasks.map(task => {

        const isCompleted =
            task.status === "completed";

        const isFocus =
            task.isFocus === true;

        const energy =
            task.energyLevel || "medium";

        const energyHTML = `
            <span class="energy-badge energy-${energy}">
                <span class="energy-icon">
                    ${getEnergyIcon(energy)}
                </span>

                <span>
                    ${formatEnergy(energy)}
                </span>
            </span>
        `;

        const reminderHTML = task.reminder
            ? `
                <div class="task-reminder">
                    <span class="reminder-icon">
                        🔔
                    </span>

                    <span>
                        ${formatReminder(task.reminder)}
                    </span>
                </div>
            `
            : "";

        const dueDateHTML = task.dueDate
            ? `
                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${formatDate(task.dueDate)}
                </span>
            `
            : "";

        return `
            <div
                class="
                    task-card
                    ${isCompleted ? "completed-task" : ""}
                    ${isFocus ? "is-focus" : ""}
                "
                data-task-id="${task._id}"
            >

                <!-- CHECKBOX -->

                <div class="task-checkbox-container">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        ${isCompleted ? "checked" : ""}
                        onchange="
                            toggleTaskCompletion(
                                '${task._id}',
                                this.checked
                            )
                        "
                    >

                </div>


                <!-- TASK CONTENT -->

                <div class="task-content">

                    <div class="task-header">

                        <h3>
                            ${escapeHTML(task.title)}
                        </h3>

                        <span
                            class="
                                priority-badge
                                ${task.priority || "medium"}
                            "
                        >
                            ${formatPriority(task.priority)}
                        </span>

                    </div>


                    ${
                        task.description
                            ? `
                                <p>
                                    ${escapeHTML(
                                        task.description
                                    )}
                                </p>
                            `
                            : ""
                    }


                    <div class="task-meta">

                        <span class="status-item">

                            <i class="fa-solid fa-spinner"></i>

                            ${formatStatus(task.status)}

                        </span>

                        ${dueDateHTML}

                        ${energyHTML}

                    </div>

                    ${reminderHTML}

                </div>


                <!-- TASK ACTIONS -->

                <div class="task-actions">

                    <button
                        type="button"
                        class="
                            focus-task-button
                            ${isFocus ? "active" : ""}
                        "
                        onclick="
                            ${
                                isFocus
                                    ? `removeFocus('${task._id}')`
                                    : `setFocus('${task._id}')`
                            }
                        "
                        title="${
                            isFocus
                                ? "Remove focus"
                                : "Set as focus"
                        }"
                    >
                        <span class="focus-button-icon">
                            🌙
                        </span>
                    </button>


                    <button
                        type="button"
                        class="edit-task-button"
                        onclick="
                            editTask('${task._id}')
                        "
                        title="Edit task"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>


                    <button
                        type="button"
                        class="delete-task-button"
                        onclick="
                            deleteTask('${task._id}')
                        "
                        title="Delete task"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>
        `;

    }).join("");
}

// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics(tasks) {

    const total =
        tasks.length;

    const pending =
        tasks.filter(
            task => task.status === "pending"
        ).length;

    const inProgress =
        tasks.filter(
            task => task.status === "in-progress"
        ).length;

    const completed =
        tasks.filter(
            task => task.status === "completed"
        ).length;

    if (totalTasksElement) {
        totalTasksElement.textContent = total;
    }

    if (pendingTasksElement) {
        pendingTasksElement.textContent = pending;
    }

    if (progressTasksElement) {
        progressTasksElement.textContent = inProgress;
    }

    if (completedTasksElement) {
        completedTasksElement.textContent = completed;
    }
}

// =========================================================
// FOCUS OF THE DAY
// =========================================================

function displayFocusTask() {

    if (!focusTaskContainer) {
        return;
    }

    const focusTask =
        currentTasks.find(
            task =>
                task.isFocus === true &&
                task.status !== "completed"
        );

    if (!focusTask) {

        focusTaskContainer.innerHTML = `
            <div class="focus-empty">

                <div class="focus-empty-icon">
                    🌙
                </div>

                <div>

                    <h3>
                        Choose your focus
                    </h3>

                    <p>
                        Select one task below as your
                        main priority for today.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    focusTaskContainer.innerHTML = `
        <div class="focus-task">

            <div class="focus-task-icon">
                🌙
            </div>

            <div class="focus-task-content">

                <span class="focus-task-label">
                    TODAY'S FOCUS
                </span>

                <h3 class="focus-task-title">
                    ${escapeHTML(focusTask.title)}
                </h3>

                ${
                    focusTask.description
                        ? `
                            <p class="focus-task-description">
                                ${escapeHTML(
                                    focusTask.description
                                )}
                            </p>
                        `
                        : ""
                }

            </div>

            <button
                type="button"
                class="remove-focus-button"
                onclick="
                    removeFocus('${focusTask._id}')
                "
            >
                Remove Focus
            </button>

        </div>
    `;
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

                    body: JSON.stringify({
                        isFocus: true
                    })
                }
            );

        const data =
            await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

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

                    body: JSON.stringify({
                        isFocus: false
                    })
                }
            );

        const data =
            await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

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
// TOGGLE TASK COMPLETION
// =========================================================

async function toggleTaskCompletion(
    taskId,
    isCompleted
) {

    const newStatus =
        isCompleted
            ? "completed"
            : "pending";

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

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        const data =
            await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

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
// EDIT TASK
// =========================================================

function editTask(taskId) {

    const task =
        currentTasks.find(
            item => item._id === taskId
        );

    if (!task) {
        return;
    }

    editingTaskId = taskId;

    taskTitle.value =
        task.title || "";

    taskDescription.value =
        task.description || "";

    taskStatus.value =
        task.status || "pending";

    taskPriority.value =
        task.priority || "medium";

    taskEnergy.value =
        task.energyLevel || "medium";

    if (task.reminder) {

        const reminderDate =
            new Date(task.reminder);

        if (!isNaN(reminderDate.getTime())) {

            const year =
                reminderDate.getFullYear();

            const month =
                String(
                    reminderDate.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    reminderDate.getDate()
                ).padStart(2, "0");

            const hours =
                String(
                    reminderDate.getHours()
                ).padStart(2, "0");

            const minutes =
                String(
                    reminderDate.getMinutes()
                ).padStart(2, "0");

            taskReminder.value =
                `${year}-${month}-${day}T${hours}:${minutes}`;

        }

    } else {

        taskReminder.value = "";

    }

    taskSubmitButton.textContent =
        "Update Task";

    taskFormContainer.style.display =
        "block";

    taskFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
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

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

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
// ENERGY
// =========================================================

function formatEnergy(energy) {

    if (energy === "low") {
        return "Low Energy";
    }

    if (energy === "high") {
        return "High Energy";
    }

    return "Medium Energy";
}

// =========================================================
// ENERGY ICON
// =========================================================

function getEnergyIcon(energy) {

    if (energy === "low") {
        return "🟢";
    }

    if (energy === "high") {
        return "🔴";
    }

    return "🟡";
}

// =========================================================
// BROWSER NOTIFICATION PERMISSION
// =========================================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.log(
            "Browser notifications are not supported."
        );

        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {

        alert(
            "Planify notifications are blocked. " +
            "Please allow notifications for this site " +
            "in Chrome settings."
        );

        return false;
    }

    try {

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {

            console.log(
                "Planify notifications enabled."
            );

            return true;
        }

        return false;

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );

        return false;
    }
}

// =========================================================
// CLEAR REMINDER TIMERS
// =========================================================

function clearReminderTimers() {

    reminderTimers.forEach(
        timer => {
            clearTimeout(timer);
        }
    );

    reminderTimers.clear();
}

// =========================================================
// SCHEDULE ALL REMINDERS
// =========================================================

function scheduleAllReminders() {

    clearReminderTimers();

    currentTasks.forEach(
        task => {
            scheduleReminder(task);
        }
    );
}

// =========================================================
// SCHEDULE SINGLE REMINDER
// =========================================================

function scheduleReminder(task) {

    if (!task.reminder) {
        return;
    }

    if (task.status === "completed") {
        return;
    }

    const reminderTime =
        new Date(task.reminder);

    if (isNaN(reminderTime.getTime())) {
        return;
    }

    const notificationKey =
        getReminderKey(task);

    /*
     * Prevent the same reminder from
     * appearing multiple times.
     */

    if (
        localStorage.getItem(
            notificationKey
        )
    ) {
        return;
    }

    const delay =
        reminderTime.getTime() -
        Date.now();

    /*
     * If reminder time has already passed,
     * trigger it immediately.
     */

    if (delay <= 0) {

        triggerReminder(
            task,
            notificationKey
        );

        return;
    }

    /*
     * JavaScript setTimeout has a maximum
     * delay of 2147483647 milliseconds.
     */

    const MAX_DELAY =
        2147483647;

    const timerDelay =
        Math.min(
            delay,
            MAX_DELAY
        );

    const timer =
        setTimeout(
            () => {

                if (
                    reminderTime.getTime() <=
                    Date.now()
                ) {

                    triggerReminder(
                        task,
                        notificationKey
                    );

                } else {

                    /*
                     * Reminder is more than
                     * the maximum timeout away.
                     * Schedule it again.
                     */

                    scheduleReminder(task);
                }

            },
            timerDelay
        );

    reminderTimers.set(
        notificationKey,
        timer
    );
}

// =========================================================
// TRIGGER REMINDER
// =========================================================

function triggerReminder(
    task,
    notificationKey
) {

    if (task.status === "completed") {
        return;
    }

    if (
        localStorage.getItem(
            notificationKey
        )
    ) {
        return;
    }

    if (!("Notification" in window)) {

        console.log(
            "Browser notifications are not supported."
        );

        return;
    }

    if (
        Notification.permission !==
        "granted"
    ) {

        console.log(
            "Planify notification permission " +
            "has not been granted."
        );

        return;
    }

    try {

        const notification =
            new Notification(
                "🔔 Planify Reminder",
                {
                    body:
                        `It's time to work on: ${task.title}`,

                    icon:
                        "images/logo.png",

                    tag:
                        `planify-reminder-${task._id}`,

                    requireInteraction:
                        true
                }
            );

        notification.onclick =
            () => {

                window.focus();

                const taskCard =
                    document.querySelector(
                        `[data-task-id="${task._id}"]`
                    );

                if (taskCard) {

                    taskCard.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

                notification.close();
            };

        localStorage.setItem(
            notificationKey,
            "true"
        );

        reminderTimers.delete(
            notificationKey
        );

        console.log(
            `Reminder notification shown for: ${task.title}`
        );

    } catch (error) {

        console.error(
            "Unable to show Planify notification:",
            error
        );
    }
}

// =========================================================
// REMINDER SAFETY CHECK
// =========================================================

function checkReminders() {

    if (
        !currentTasks ||
        currentTasks.length === 0
    ) {
        return;
    }

    currentTasks.forEach(
        task => {

            if (
                !task.reminder ||
                task.status === "completed"
            ) {
                return;
            }

            const reminderTime =
                new Date(task.reminder);

            if (
                isNaN(
                    reminderTime.getTime()
                )
            ) {
                return;
            }

            if (
                reminderTime.getTime() <=
                Date.now()
            ) {

                const notificationKey =
                    getReminderKey(task);

                if (
                    !localStorage.getItem(
                        notificationKey
                    )
                ) {

                    triggerReminder(
                        task,
                        notificationKey
                    );
                }
            }
        }
    );
}

// =========================================================
// REMINDER KEY
// =========================================================

function getReminderKey(task) {

    return (
        `planify-reminder-${task._id}-` +
        `${new Date(task.reminder).getTime()}`
    );
}

// =========================================================
// FORMAT REMINDER
// =========================================================

function formatReminder(dateString) {

    const date =
        new Date(dateString);

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return "Invalid reminder";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

// =========================================================
// FORMAT STATUS
// =========================================================

function formatStatus(status) {

    if (status === "in-progress") {
        return "In Progress";
    }

    if (status === "completed") {
        return "Completed";
    }

    return "Pending";
}

// =========================================================
// FORMAT PRIORITY
// =========================================================

function formatPriority(priority) {

    if (priority === "high") {
        return "High";
    }

    if (priority === "low") {
        return "Low";
    }

    return "Medium";
}

// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value || "")
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
// HANDLE UNAUTHORIZED
// =========================================================

function handleUnauthorized() {

    clearReminderTimers();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert(
        "Your session has expired. Please login again."
    );

    window.location.href =
        "index.html";
}

// =========================================================
// START DASHBOARD
// =========================================================

if (taskList) {

    loadTasks();

    /*
     * Safety check every 10 seconds.
     * This helps trigger reminders if the
     * browser timer was delayed.
     */

    setInterval(
        checkReminders,
        10000
    );
}