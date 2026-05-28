const cards = document.querySelectorAll(".card");
const board = document.querySelector(".game-board");

let selectedCard = null;

/* =========================
   DRAG START
========================= */

cards.forEach(card => {

    card.addEventListener("dragstart", (e) => {

        selectedCard = card;

        card.classList.add("dragging");

    });

});

/* =========================
   ENABLE DRAG
========================= */

cards.forEach(card => {
    card.setAttribute("draggable", true);
});

/* =========================
   DRAG OVER BOARD
========================= */

board.addEventListener("dragover", (e) => {

    e.preventDefault();

});

/* =========================
   DROP CARD
========================= */

board.addEventListener("drop", (e) => {

    e.preventDefault();

    if(!selectedCard) return;

    /* POSITION */

    const boardRect = board.getBoundingClientRect();

    const x = e.clientX - boardRect.left;
    const y = e.clientY - boardRect.top;

    /* CREATE TROOP */

    const troop = document.createElement("div");

    troop.classList.add("troop");

    troop.innerText =
    selectedCard.querySelector("h3").innerText;

    troop.style.left = `${x - 35}px`;
    troop.style.top = `${y - 35}px`;

    board.appendChild(troop);

    /* BATTLE LOG */

    addLog(
        `${troop.innerText} invocado`
    );

    /* REMOVE DRAG STATE */

    selectedCard.classList.remove("dragging");

    selectedCard = null;

});

/* =========================
   LOG SYSTEM
========================= */

function addLog(message){

    const logContainer =
    document.querySelector(".log-messages");

    const p = document.createElement("p");

    p.innerText = `⚔️ ${message}`;

    logContainer.prepend(p);

}
