/* =============================================================================
   1. SELECTORS
   ============================================================================= */
const card = document.querySelector(".overlay");
const formBtn = document.querySelector(".new-list-btn");
const formBtnm = document.querySelector(".fab");
const cancelBtn = document.querySelector(".cancel");
const submitBtn = document.querySelector(".submit");

const taskInp = document.querySelector(".task");
const descInp = document.querySelector(".taskDesc");
const dateInp = document.querySelector(".dateTime");
const tasksList = document.querySelector(".tasks-list");
const currDateBadge = document.querySelector(".date-badge");
const taskCountDisplay = document.querySelector(".taskNo");

/* =============================================================================
   2. UI INITIALIZATION
   ============================================================================= */
const updateUI = () => {
  const now = new Date();
  currDateBadge.innerText = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  updateTaskCount();
};

const updateTaskCount = () => {
  taskCountDisplay.innerText = tasksList.querySelectorAll(".task-card").length;
};

updateUI();

/* =============================================================================
   3. MODAL LOGIC
   ============================================================================= */
const toggleModal = (show) => {
  card.classList.toggle("visible", show);
  if (!show) {
    taskInp.value = "";
    descInp.value = "";
    dateInp.value = "";
  }
};

formBtn.addEventListener("click", () => toggleModal(true));
formBtnm.addEventListener("click", () => toggleModal(true));
cancelBtn.addEventListener("click", () => toggleModal(false));

/* =============================================================================
   4. TASK CREATION (UNIQUE IDs)
   ============================================================================= */
submitBtn.addEventListener("click", () => {
  if (!taskInp.value || !descInp.value || !dateInp.value) {
    alert("Please fill in all details");
    return;
  }

  const dateObj = new Date(dateInp.value);
  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);

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
    <button class="edit-action">
      <i class="fa-solid fa-pen"></i>Edit
    </button>
    <button class="done-action">
      <i class="fa-regular fa-circle-check"></i>Complete
    </button>
    <button class="delete-action">
      <i class="fa-regular fa-trash" style="color:red;"></i>Delete
    </button>
  </div>
`;

  tasksList.appendChild(taskCard);
  updateTaskCount();
  toggleModal(false);
});

/* =============================================================================
   5. TASK OPERATIONS (EVENT DELEGATION)
   ============================================================================= */
tasksList.addEventListener("click", (e) => {
  const target = e.target;
  const taskCard = target.closest(".task-card");
  if (!taskCard) return;

  // 👉 OPEN MENU
  if (target.closest(".task-menu")) {
    // e.stopPropagation();

    const currentMenu = taskCard.querySelector(".menubtn");

    document.querySelectorAll(".menubtn").forEach((m) => {
      if (m !== currentMenu) {
        m.classList.add("hidden-menu");
      }
    });

    currentMenu.classList.toggle("hidden-menu");
  }

  // 👉 DELETE
  if (target.closest(".delete-action")) {
    taskCard.remove();
    updateTaskCount();
  }
  
  // 👉 COMPLETE
  if (target.closest(".done-action")) {
    taskCard.querySelector(".task-name");
    taskCard.classList.add("done");
    taskCard.remove();
    updateTaskCount();
    // 👉 CLOSE MENU
    const menu = taskCard.querySelector(".menubtn");
    menu.innerHTML = "";
  }

  // 👉 EDIT
  if (target.closest(".edit-action")) {
    alert("Edit mode for: " + taskCard.querySelector(".task-name").innerText);
  }
});

document.addEventListener("click", (e) => {
  // if click is NOT on menu AND NOT on 3-dot
  if (!e.target.closest(".task-menu") && !e.target.closest(".menubtn")) {
    document
      .querySelectorAll(".menubtn")
      .forEach((m) => m.classList.add("hidden-menu"));
  }
});


// const links = document.querySelectorAll(".navList");
// const currentPage = window.location.pathname;

// links.forEach(link => {
//   if (link.href.includes(currentPage)) {
//     link.classList.add("active");
//   }
// });