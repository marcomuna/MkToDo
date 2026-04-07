// if (!element) return;

const tasksList = document.querySelector(".tasks-list");

// TASK OPERATIONS
if (tasksList) {
  tasksList.addEventListener("click", (e) => {
    const target = e.target;
    const taskCard = target.closest(".task-card");
    if (!taskCard) return;

    // OPEN MENU
    if (target.closest(".task-menu")) {
      const currentMenu = taskCard.querySelector(".menubtn");

      document.querySelectorAll(".menubtn").forEach((m) => {
        if (m !== currentMenu) {
          m.classList.add("hidden-menu");
        }
      });

      currentMenu.classList.toggle("hidden-menu");
    }

    // DELETE
    if (target.closest(".delete-action")) {
      taskCard.remove();
    }

    // COMPLETE
    if (target.closest(".done-action")) {
      taskCard.classList.add("done");
      taskCard.remove();
    }

    // EDIT
    if (target.closest(".edit-action")) {
      alert("Edit: " + taskCard.querySelector(".task-name").innerText);
    }
  });
}

// CLOSE MENU OUTSIDE CLICK
document.addEventListener("click", (e) => {
  if (!e.target.closest(".task-menu") && !e.target.closest(".menubtn")) {
    document
      .querySelectorAll(".menubtn")
      .forEach((m) => m.classList.add("hidden-menu"));
  }
});