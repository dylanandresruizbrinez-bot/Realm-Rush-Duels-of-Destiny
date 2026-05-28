const cards = document.querySelectorAll(".card");
const board = document.querySelector(".game-board");

let selectedCard = null;

let troops = [];

/* =========================================
   CARDS DATA
========================================= */

const cardsData = {

    "Guerrero": {
        hp: 150,
        damage: 20,
        speed: 1.2,
        color: "#ff8800"
    },

    "Arquero": {
        hp: 90,
        damage: 15,
        speed: 1.5,
        color: "#00ffaa"
    },

    "Mago": {
        hp: 80,
        damage: 30,
        speed: 1,
        color: "#8b5cf6"
    },

    "Dragón": {
        hp: 300,
        damage: 45,
        speed: 0.8,
        color: "#ff004c"
    }

};
/* =========================================
   ENEMY AI
========================================= */

const enemyDeck = [

    "Guerrero",
    "Arquero",
    "Mago",
    "Dragón"

];
/* =========================================
   ENABLE DRAG
========================================= */

cards.forEach(card => {

    card.setAttribute("draggable", true);

    card.addEventListener("dragstart", () => {

        selectedCard = card;

        card.classList.add("dragging");

    });

});

/* =========================================
   DRAG OVER
========================================= */

board.addEventListener("dragover", (e) => {

    e.preventDefault();

});

/* =========================================
   DROP SYSTEM
========================================= */

board.addEventListener("drop", (e) => {

    e.preventDefault();

    if(!selectedCard) return;

    const boardRect =
    board.getBoundingClientRect();

    const x =
    e.clientX - boardRect.left;

    const y =
    e.clientY - boardRect.top;

    /* ONLY PLAYER SIDE */

    if(y < board.offsetHeight / 2){

        addLog(
            "No puedes invocar en territorio enemigo"
        );

        return;

    }

    const troopName =
    selectedCard.querySelector("h3").innerText;

    spawnTroop(
        troopName,
        x,
        y,
        "player"
    );

    selectedCard.classList.remove("dragging");

    selectedCard = null;

});

/* =========================================
   SPAWN TROOP
========================================= */

function spawnTroop(name, x, y, team){

    const stats = cardsData[name];

    if(!stats) return;

    const troop = document.createElement("div");

    troop.classList.add("troop");
troop.classList.add(team);
    troop.innerHTML = `
        <div class="hp-bar">
            <div class="hp-fill"></div>
        </div>

        <span>${name}</span>
    `;

    troop.style.left = `${x - 35}px`;
    troop.style.top = `${y - 35}px`;

    if(team === "player"){

    troop.style.background =
    `linear-gradient(
        135deg,
        ${stats.color},
        #ffffff
    )`;

}
else{

    troop.style.background =
    `linear-gradient(
        135deg,
        #ff0033,
        ${stats.color}
    )`;

}

    board.appendChild(troop);

    const troopObj = {

        element: troop,

        name,

        team,

        hp: stats.hp,

        maxHp: stats.hp,

        damage: stats.damage,

        speed: stats.speed,

        x: x - 35,

        y: y - 35

    };

    troops.push(troopObj);

    addLog(`${name} invocado`);

}

/* =========================================
   GAME LOOP
========================================= */

function gameLoop(){

    troops.forEach(troop => {

        moveTroop(troop);

        updateTroop(troop);

    });

    requestAnimationFrame(gameLoop);

}
/* =========================================
   ENEMY SPAWN AI
========================================= */

function enemyAI(){

    const randomCard =

    enemyDeck[
        Math.floor(
            Math.random() * enemyDeck.length
        )
    ];

    const randomX =

    Math.random() *
    (board.offsetWidth - 100) + 50;

    const randomY =

    Math.random() * 120 + 50;

    spawnTroop(
        randomCard,
        randomX,
        randomY,
        "enemy"
    );

    addLog(
        `Enemigo invocó ${randomCard}`
    );

}

/* SPAWN LOOP */

setInterval(() => {

    enemyAI();

}, 4000);
gameLoop();

/* =========================================
   MOVE TROOPS
========================================= */

function moveTroop(troop){

    if(troop.team === "player"){

        troop.y -= troop.speed;

    }

    if(troop.team === "enemy"){

        troop.y += troop.speed;

    }

    troop.element.style.top =
    `${troop.y}px`;

}
/* =========================================
   UPDATE TROOP UI
========================================= */

function updateTroop(troop){

    const hpPercent =
    (troop.hp / troop.maxHp) * 100;

    troop.element
    .querySelector(".hp-fill")
    .style.width = `${hpPercent}%`;

}

/* =========================================
   BATTLE LOG
========================================= */

function addLog(message){

    const log =
    document.querySelector(".log-messages");

    const p = document.createElement("p");

    p.innerText = `⚔️ ${message}`;

    log.prepend(p);

}
