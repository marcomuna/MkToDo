/* =============================================================================
   1. SELECTORS & GLOBAL VARIABLES
   ============================================================================= */
// Modal & Form Elements
const card = document.querySelector(".overlay");
const formBtn = document.querySelector(".new-list-btn"); // Sidebar button
const formBtnm = document.querySelector(".fab"); // Floating action button
const cancelBtn = document.querySelector(".cancel");
const submitBtn = document.querySelector(".submit");

// Input Fields
const taskInp = document.querySelector(".task");
const descInp = document.querySelector(".taskDesc");
const dateInp = document.querySelector(".dateTime");

// Display & List Containers
const tasksList = document.querySelector(".tasks-list");
const currDateBadge = document.querySelector(".date-badge");
const taskCountDisplay = document.querySelector(".taskNo");

/* =============================================================================
   2. UI INITIALIZATION & SYNC
   ============================================================================= */
/**
 * Sets the current date and refreshes the task counter upon page load.
 */
const updateUI = () => {
  const now = new Date();

  // Only update if current date badge exists (Home page)
  if (currDateBadge) {
    currDateBadge.innerText = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }
  updateTaskCount();
};

/**
 * Recalculates the number of task cards currently in the DOM.
 */
const updateTaskCount = () => {
  if (taskCountDisplay && tasksList) {
    taskCountDisplay.innerText =
      tasksList.querySelectorAll(".task-card").length;
  }
};

// Execute initial UI setup
updateUI();

/* =============================================================================
   3. MODAL LOGIC (OPEN/CLOSE)
   ============================================================================= */
/**
 * Toggles the visibility of the task creation modal.
 * @param {boolean} show - True to show, false to hide.
 */
const toggleModal = (show) => {
  // Guard clause: Exit if the modal isn't present on the current page
  if (!card) return;

  card.classList.toggle("visible", show);

  // Clear inputs when closing the modal
  if (!show && taskInp) {
    taskInp.value = "";
    descInp.value = "";
    dateInp.value = "";
  }
};

// Attach listeners only if the elements exist on the current page
if (formBtn) formBtn.addEventListener("click", () => toggleModal(true));
if (formBtnm) formBtnm.addEventListener("click", () => toggleModal(true));
if (cancelBtn) cancelBtn.addEventListener("click", () => toggleModal(false));

/* =============================================================================
   4. TASK CREATION
   ============================================================================= */
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    // Validation: Ensure no empty fields
    if (!taskInp.value || !descInp.value || !dateInp.value) {
      alert("Please fill in all details");
      return;
    }

    // Date Formatting (e.g., 27/06/2026, 09:00 am)
    const dateObj = new Date(dateInp.value);
    const formattedTime = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
    // =============================================================================
    // Create Task Element
    // =============================================================================
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.innerHTML = `
      <div class="task-left">
        <div>
          <h4 class="task-name">${taskInp.value}</h4>
          <span class="task-time">Schedule ${formattedTime}</span>
          <p class="task-decription">${descInp.value}</p>
        </div>
      </div>
      <button class="task-menu">&#8942;</button>
      <div class="menubtn hidden-menu">
        <button class="edit-action"><i class="fa-solid fa-pen"></i>Edit</button>
        <button class="done-action"><i class="fa-regular fa-circle-check"></i>Complete</button>
        <button class="delete-action"><i class="fa-regular fa-trash" style="color:red;"></i>Delete</button>
      </div>`;

    // Append to list and reset UI
    if (tasksList) {
      tasksList.appendChild(taskCard);
      updateTaskCount();
      toggleModal(false);
    }
  });
}

/* =============================================================================
   5. TASK OPERATIONS (EVENT DELEGATION)
   ============================================================================= */
/**
 * Uses Event Delegation on the .tasks-list container to handle
 * clicks on dynamically created task cards.
 */
if (tasksList) {
  tasksList.addEventListener("click", (e) => {
    const target = e.target;
    const taskCard = target.closest(".task-card");
    if (!taskCard) return;

    // --- Action: Toggle 3-Dot Menu ---
    if (target.closest(".task-menu")) {
      const currentMenu = taskCard.querySelector(".menubtn");

      // Close any other open menus first
      document.querySelectorAll(".menubtn").forEach((m) => {
        if (m !== currentMenu) m.classList.add("hidden-menu");
      });

      currentMenu.classList.toggle("hidden-menu");
    }

    // --- Action: Delete Task ---
    if (target.closest(".delete-action")) {
      taskCard.remove();
      updateTaskCount();
    }

    // --- Action: Mark Complete ---
    if (target.closest(".done-action")) {
      taskCard.classList.add("done");
      // Current behavior: Removes task from view on completion
      taskCard.remove();
      updateTaskCount();
    }

    // --- Action: Edit Task ---
    if (target.closest(".edit-action")) {
      const taskName = taskCard.querySelector(".task-name").innerText;
      alert("Edit mode for: " + taskName);
    }
  });
}

/**
 * Global click listener to close open menus if user clicks outside
 */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".task-menu") && !e.target.closest(".menubtn")) {
    document
      .querySelectorAll(".menubtn")
      .forEach((m) => m.classList.add("hidden-menu"));
  }
});

/* =============================================================================
   6. PWA / SERVICE WORKER REGISTRATION
   ============================================================================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("SW registered:", reg))
      .catch((err) => console.log("SW registration failed:", err));
  });
}
