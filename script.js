/* =============================================================================
   1. LOCAL STORAGE UTILITIES
   ============================================================================= */

// Get tasks from LocalStorage, or return an empty list if none exist
const getSavedTasks = () => JSON.parse(localStorage.getItem("myTasks")) || [];

// Save the current list of tasks to LocalStorage
const saveTasksToStore = (tasks) =>
  localStorage.setItem("myTasks", JSON.stringify(tasks));

/* =============================================================================
   2. DOM SELECTORS & GLOBAL VARIABLES
   ============================================================================= */

// Modal & Overlay elements
const card = document.querySelector(".overlay");
const formBtns = document.querySelectorAll(".new-list-btn, .fab");
const cancelBtn = document.querySelector(".cancel");
const submitBtn = document.querySelector(".submit");
const modalTitle = document.querySelector(".modal h2");

// Form input elements
const taskInp = document.querySelector(".task");
const descInp = document.querySelector(".taskDesc");
const dateInp = document.querySelector(".dateTime");

// Display & List elements
const tasksList = document.querySelector(".tasks-list");
const currDateBadge = document.querySelector(".date-badge");
const taskCountDisplay = document.querySelector(".taskNo");

// Filter & Navigation elements
const quickBtns = document.querySelectorAll(".quick-btn");
const filterEl = document.querySelector("#filter");

// Track the ID of the task being edited. Null means we are creating a new task.
let editingTaskId = null;

// Updates the current date badge displayed on the screen
const updateUI = () => {
  const now = new Date();
  if (currDateBadge) {
    currDateBadge.innerText = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }
};

// Updates the task counter and subtitle, specifically handling the home page vs tasks page
const homeUpdateUI = () => {
  const countEl = document.querySelector(".taskNo");
  const subtitle = document.querySelector(".page-subtitle");

  const allTasks = getSavedTasks();
  const total = allTasks.length;

  // ===============================
  // HOME PAGE (index.html)
  // ===============================
  if (!filterEl) {
    const todayTasks = document.querySelectorAll(".task-card").length;
    if (countEl) countEl.innerText = todayTasks;

    // 👉 STEP PROGRESS (HOME PAGE)
    const stepsContainer = document.querySelector(".steps-container");

    if (stepsContainer) {
      stepsContainer.innerHTML = "";

      const completed = allTasks.filter((t) => t.completed).length;

      for (let i = 0; i < total; i++) {
        const step = document.createElement("div");
        step.classList.add("step-box");

        if (i < completed) {
          step.classList.add("completed");
        }

        stepsContainer.appendChild(step);
      }
    }

    return;
  }

  // ===============================
  // TASK PAGE (task.html)
  // ===============================
  const filterValue = filterEl.value;
  const now = new Date();
  now.setSeconds(0, 0);

  let filteredCount = 0;

  allTasks.forEach((task) => {
    const taskDate = new Date(task.time);
    taskDate.setSeconds(0, 0);

    const isExpired = taskDate < now;

    if (filterValue === "completed" && task.completed) filteredCount++;
    else if (filterValue === "expired" && isExpired && !task.completed)
      filteredCount++;
    else if (filterValue === "pending" && !task.completed && !isExpired)
      filteredCount++;
    else if (filterValue === "all") filteredCount++;
  });

  // ✅ FIX TEXT
  if (subtitle) {
    subtitle.innerHTML = `
      You have <span class="taskNo">${filteredCount}</span> 
      ${filterValue} tasks out of ${total}.
    `;
  }
};
// Handles opening and closing the task creation/editing modal
const toggleModal = (show) => {
  if (!card) return;
  card.classList.toggle("visible", show);

  // Clear inputs and reset state when closing the modal
  if (!show) {
    taskInp.value = "";
    descInp.value = "";
    dateInp.value = "";
    editingTaskId = null;
    if (modalTitle) modalTitle.innerText = "Create List";
  }
};

/* =============================================================================
   5. CORE RENDERING LOGIC
   The main function that filters, sorts, and draws the tasks to the DOM.
   ============================================================================= */

const renderTasks = () => {
  if (!tasksList) return;

  let tasks = getSavedTasks();

  // 1. Check which page we are on (Home vs. All Tasks)
  const isAllTasksPage = document.querySelector("#filter") !== null;

  // 2. Filter logic for index.html (Home Page - shows only today's tasks)
  if (!isAllTasksPage) {
    const now = new Date();
    now.setSeconds(0, 0);

    tasks = tasks.filter((task) => {
      const taskDate = new Date(task.time);
      taskDate.setSeconds(0, 0);

      return (
        taskDate.toDateString() === now.toDateString() && // Must be exactly today
        taskDate >= now // Must not be in the past (up to the minute)
      );
    });
  }

  // 3. Sorting tasks chronologically (earliest first)
  tasks.sort((a, b) => {
    const dateA = new Date(a.time);
    const dateB = new Date(b.time);
    return dateA - dateB;
  });

  // 4. Filtering logic for task.html (Applying dropdown filters)
  const savedFilter = localStorage.getItem("taskFilter");

  if (filterEl) {
    // Check if there's a filter saved from the dashboard quick buttons
    if (savedFilter) {
      filterEl.value = savedFilter;
      localStorage.removeItem("taskFilter");
    } else {
      filterEl.value = filterEl.value || "pending";
    }

    const filterValue = filterEl.value;
    const now = new Date();
    now.setSeconds(0, 0);

    // Apply the active filter to the tasks array
    tasks = tasks.filter((task) => {
      const taskDate = new Date(task.time);
      taskDate.setSeconds(0, 0);
      const isExpired = taskDate < now;

      if (filterValue === "completed") return task.completed;
      if (filterValue === "expired") return isExpired && !task.completed;
      if (filterValue === "pending") return !task.completed && !isExpired;
      return true; // "all"
    });
  }

  // 5. Clear the current list before rendering new items
  tasksList.innerHTML = "";

  // 6. Generate HTML for each task and append it to the DOM
  tasks.forEach((task) => {
    const formattedTime = new Date(task.time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Create the main card container
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    if (task.completed) {
      taskCard.classList.add("done");
    }

    taskCard.setAttribute("data-id", task.id);

    // Check expiration status for styling
    const now = new Date();
    now.setSeconds(0, 0);
    const taskDateCheck = new Date(task.time);
    taskDateCheck.setSeconds(0, 0);
    const isExpired = taskDateCheck < now;

    if (isExpired && !task.completed) {
      taskCard.classList.add("expired");
    }

    // Populate the card's HTML
    taskCard.innerHTML = `
      <div class="task-left">
        <div>
         <h4 class="task-name">
  ${task.name} 
  ${task.completed ? '<span class="completed-text">(Completed)</span>' : ""}
  ${isExpired && !task.completed ? '<span class="expired-text">(Expired)</span>' : ""}
  ${!task.completed && !isExpired ? '<span class="pending-text">(Pending)</span>' : ""}
  </h4>
          <span class="task-time">Schedule ${formattedTime}</span>
          <p class="task-decription">${task.desc}</p>
        </div>
      </div>
      ${
        // Hide action menus if the task is done or expired
        task.completed || isExpired
          ? ""
          : `
<button class="task-menu">&#8942;</button>
<div class="menubtn hidden-menu">
  <button class="edit-action"><i class="fa-solid fa-pen"></i>Edit</button>
  <button class="done-action"><i class="fa-regular fa-circle-check"></i>${task.completed ? "Undo" : "Complete"}</button>
  <button class="delete-action"><i class="fa-regular fa-trash"></i>Delete</button>
</div>
`
      }`;

    tasksList.appendChild(taskCard);
  });

  // 7. Update headers and counters after rendering
  updateUI();
  homeUpdateUI();
};

/* =============================================================================
   6. EVENT LISTENERS
   All user interactions (clicks, submits, changes) are handled here.
   ============================================================================= */

// Dashboard quick action buttons (navigate to tasks page with pre-set filter)
quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter");
    localStorage.setItem("taskFilter", filter);
    window.location.href = "task.html";
  });
});

// Open modal buttons
formBtns.forEach((btn) =>
  btn.addEventListener("click", () => toggleModal(true)),
);

// Close modal button
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => toggleModal(false));
}

// Form Submission (Create or Update Task)
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    // Basic validation
    if (!taskInp.value || !descInp.value || !dateInp.value) {
      alert("Please fill in all details");
      return;
    }

    let allTasks = getSavedTasks();

    if (editingTaskId) {
      // Logic for UPDATING an existing task
      const taskIndex = allTasks.findIndex((t) => t.id === editingTaskId);
      if (taskIndex > -1) {
        allTasks[taskIndex].name = taskInp.value;
        allTasks[taskIndex].desc = descInp.value;
        allTasks[taskIndex].time = dateInp.value;
      }
    } else {
      // Logic for CREATING a new task
      const newTask = {
        id: Date.now(),
        name: taskInp.value,
        desc: descInp.value,
        time: dateInp.value,
        completed: false,
      };
      allTasks.push(newTask);
    }

    // Save, close modal, and refresh UI
    saveTasksToStore(allTasks);
    toggleModal(false);
    renderTasks();
  });
}

// Event Delegation for Task Actions (Edit, Complete, Delete, Menu Toggle)
if (tasksList) {
  tasksList.addEventListener("click", (e) => {
    const target = e.target;
    const taskCard = target.closest(".task-card");
    if (!taskCard) return;

    const taskId = Number(taskCard.getAttribute("data-id"));
    let tasks = getSavedTasks();

    // --- Action: Toggle 3-Dot Menu ---
    if (target.closest(".task-menu")) {
      const currentMenu = taskCard.querySelector(".menubtn");
      // Close other open menus before opening this one
      document.querySelectorAll(".menubtn").forEach((m) => {
        if (m !== currentMenu) m.classList.add("hidden-menu");
      });
      currentMenu.classList.toggle("hidden-menu");
      return;
    }

    // --- Action: Delete Task ---
    if (target.closest(".delete-action")) {
      tasks = tasks.filter((t) => t.id !== taskId);
      saveTasksToStore(tasks);
      renderTasks();
    }

    // --- Action: Mark Complete / Undo ---
    if (target.closest(".done-action")) {
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed; // Toggle boolean
        saveTasksToStore(tasks);
        renderTasks();
      }
    }

    // --- Action: Edit Task ---
    if (target.closest(".edit-action")) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        // Populate form with existing data
        taskInp.value = task.name;
        descInp.value = task.desc;
        dateInp.value = task.time;
        editingTaskId = task.id; // Set global tracker

        if (modalTitle) modalTitle.innerText = "Edit Task";
        toggleModal(true);

        // Hide the menu box after clicking edit
        taskCard.querySelector(".menubtn").classList.add("hidden-menu");
      }
    }
  });
}

// Global listener to close open 3-dot menus when clicking anywhere else on the screen
document.addEventListener("click", (e) => {
  if (!e.target.closest(".task-menu") && !e.target.closest(".menubtn")) {
    document
      .querySelectorAll(".menubtn")
      .forEach((m) => m.classList.add("hidden-menu"));
  }
});

// Dropdown Filter Listener
if (filterEl) {
  filterEl.addEventListener("change", () => {
    renderTasks();
  });
}

/* =============================================================================
   7. INITIALIZATION
   Code that runs immediately when the script loads to set up the app.
   ============================================================================= */

// Handle initial filter setup if redirecting from dashboard
if (filterEl) {
  const savedFilter = localStorage.getItem("taskFilter");

  if (savedFilter) {
    filterEl.value = savedFilter;
    localStorage.removeItem("taskFilter");
  } else {
    filterEl.value = "pending";
  }
}

// Run the initial render
renderTasks();

// =============================================================================
// Service worker
// =============================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("✅ Service Worker Registered:", reg.scope);
    } catch (err) {
      console.log("❌ SW Registration Failed:", err);
    }
  });
}
