// Get tasks from LocalStorage, or return an empty list if none exist
const getSavedTasks = () => JSON.parse(localStorage.getItem("myTasks")) || [];

// Save the current list of tasks to LocalStorage
const saveTasksToStore = (tasks) =>
  localStorage.setItem("myTasks", JSON.stringify(tasks));

/* =============================================================================
   1. SELECTORS & GLOBAL VARIABLES
   ============================================================================= */
const card = document.querySelector(".overlay");
// Select all buttons that should open the modal (Desktop + Mobile)
const formBtns = document.querySelectorAll(".new-list-btn, .fab");
const cancelBtn = document.querySelector(".cancel");
const submitBtn = document.querySelector(".submit");

const taskInp = document.querySelector(".task");
const descInp = document.querySelector(".taskDesc");
const dateInp = document.querySelector(".dateTime");
const modalTitle = document.querySelector(".modal h2");

const tasksList = document.querySelector(".tasks-list");
const currDateBadge = document.querySelector(".date-badge");
const taskCountDisplay = document.querySelector(".taskNo");

// Track the ID of the task being edited. Null means we are creating a new task.
let editingTaskId = null;

/* =============================================================================
   2. UI INITIALIZATION & SYNC
   ============================================================================= */
const updateUI = () => {
  const now = new Date();
  if (currDateBadge) {
    currDateBadge.innerText = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }
  
  // FIX: Count the actual cards rendered on the screen, not the total storage
  if (taskCountDisplay && tasksList) {
    taskCountDisplay.innerText = tasksList.querySelectorAll(".task-card").length;
  }
};
const homeUpdateUI = () => {
  const homeTaskCount = document.querySelector(".taskNo"); 
  const now = new Date();
  if (homeTaskCount) {
    homeTaskCount.innerText = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }

  if (taskCountDisplay) {
    taskCountDisplay.innerText = getSavedTasks().length;
  }
};

/* =============================================================================
   3. MODAL LOGIC (OPEN/CLOSE)
   ============================================================================= */
const toggleModal = (show) => {
  if (!card) return;
  card.classList.toggle("visible", show);

  // Clear inputs and reset state when closing
  if (!show) {
    taskInp.value = "";
    descInp.value = "";
    dateInp.value = "";
    editingTaskId = null;
    if (modalTitle) modalTitle.innerText = "Create List";
  }
};

formBtns.forEach((btn) =>
  btn.addEventListener("click", () => toggleModal(true)),
);
if (cancelBtn) cancelBtn.addEventListener("click", () => toggleModal(false));

/* =============================================================================
   4. TASK CREATION & UPDATING
   ============================================================================= */
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (!taskInp.value || !descInp.value || !dateInp.value) {
      alert("Please fill in all details");
      return;
    }

    let allTasks = getSavedTasks();

    if (editingTaskId) {
      // UPDATE EXISTING TASK
      const taskIndex = allTasks.findIndex((t) => t.id === editingTaskId);
      if (taskIndex > -1) {
        allTasks[taskIndex].name = taskInp.value;
        allTasks[taskIndex].desc = descInp.value;
        allTasks[taskIndex].time = dateInp.value;
      }
    } else {
      // CREATE NEW TASK
      const newTask = {
        id: Date.now(),
        name: taskInp.value,
        desc: descInp.value,
        time: dateInp.value,
        completed: false, // Track completion status
      };
      allTasks.push(newTask);
    }

    saveTasksToStore(allTasks);
    toggleModal(false);
    renderTasks(); // Re-render the list dynamically
  });
}

/* =============================================================================
   5. RENDER TASKS
   ============================================================================= */
/* =============================================================================
   5. RENDER TASKS
   ============================================================================= */
const renderTasks = () => {
  if (!tasksList) return; 

  let tasks = getSavedTasks();
  
  // 1. Check which page we are on
  // If the '#filter' element does NOT exist, we are on index.html
  const isAllTasksPage = document.querySelector("#filter") !== null;

  // 2. Filter logic for index.html (Home Page)
  if (!isAllTasksPage) {
    const todayString = new Date().toDateString(); // Gets current date like "Sat Apr 11 2026"
    
    // Keep only the tasks where the task's date matches today's date
    tasks = tasks.filter((task) => {
      const taskDateString = new Date(task.time).toDateString();
      return taskDateString === todayString;
    });
  }

  tasksList.innerHTML = ""; // Clear list before rendering

  // 3. Render the filtered (or unfiltered) tasks
  tasks.forEach((task) => {
    const formattedTime = new Date(task.time).toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    if (task.completed) taskCard.classList.add("done"); 
    taskCard.setAttribute("data-id", task.id);

    taskCard.innerHTML = `
      <div class="task-left">
        <div>
          <h4 class="task-name">${task.name}</h4>
          <span class="task-time">Schedule ${formattedTime}</span>
          <p class="task-decription">${task.desc}</p>
        </div>
      </div>
      <button class="task-menu">&#8942;</button>
      <div class="menubtn hidden-menu">
        <button class="edit-action"><i class="fa-solid fa-pen"></i>Edit</button>
        <button class="done-action"><i class="fa-regular fa-circle-check"></i>${task.completed ? 'Undo' : 'Complete'}</button>
        <button class="delete-action"><i class="fa-regular fa-trash"></i>Delete</button>
      </div>`;
    
    tasksList.appendChild(taskCard);
  });

  updateUI();
  homeUpdateUI();
};

/* =============================================================================
   6. TASK OPERATIONS (EVENT DELEGATION)
   ============================================================================= */
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
      // Close other open menus
      document.querySelectorAll(".menubtn").forEach((m) => {
        if (m !== currentMenu) m.classList.add("hidden-menu");
      });
      currentMenu.classList.toggle("hidden-menu");
      return; // Stop further execution
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

// Global listener to close open menus when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".task-menu") && !e.target.closest(".menubtn")) {
    document
      .querySelectorAll(".menubtn")
      .forEach((m) => m.classList.add("hidden-menu"));
  }
});

// Run on initial load
renderTasks();
