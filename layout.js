// if (!element) return;

const card = document.querySelector(".overlay");
const formBtn = document.querySelector(".new-list-btn");
const formBtnm = document.querySelector(".fab");
const cancelBtn = document.querySelector(".cancel");
const submitBtn = document.querySelector(".submit");

const taskInp = document.querySelector(".task");
const descInp = document.querySelector(".taskDesc");
const dateInp = document.querySelector(".dateTime");
const taskCountDisplay = document.querySelector(".taskNo");
const currDateBadge = document.querySelector(".date-badge");

// UI INIT
const updateUI = () => {
  if (!currDateBadge) return;

  const now = new Date();
  currDateBadge.innerText = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};

// MODAL
if (formBtn) {
  formBtn.addEventListener("click", () => toggleModal(true));
  formBtnm.addEventListener("click", () => toggleModal(true));
  cancelBtn.addEventListener("click", () => toggleModal(false));
}

const toggleModal = (show) => {
  if (!card) return;

  card.classList.toggle("visible", show);
};

// CREATE TASK
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (!taskInp.value || !descInp.value || !dateInp.value) {
      alert("Fill all details");
      return;
    }

    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");

    taskCard.innerHTML = `...same HTML...`;

    document.querySelector(".tasks-list").appendChild(taskCard);
  });
}

updateUI();