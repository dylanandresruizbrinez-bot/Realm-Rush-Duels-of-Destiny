const cards = document.querySelectorAll(".card");
const board = document.querySelector(".game-board");

let selectedCard = null;
let projectiles = [];
let particles = [];
let troops = [];

/* =========================================
   CARDS DATA
========================================= */

const cardsData = {

    "Guerrero": {
        hp: 150,
        damage: 20,
        speed: 1.2,
        range: 40,
        attackSpeed: 900,
        color: "#ff8800"
    },

    "Arquero": {
        hp: 90,
        damage: 15,
        speed: 1.5,
        range: 140,
        attackSpeed: 700,
        color: "#00ffaa"
    },

    "Mago": {
        hp: 80,
        damage: 30,
        speed: 1,
        range: 120,
        attackSpeed: 1200,
        color: "#8b5cf6"
    },

    "Dragón": {
        hp: 300,
        damage: 45,
        speed: 0.8,
        range: 100,
        attackSpeed: 1500,
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

    range: stats.range,

    attackSpeed: stats.attackSpeed,

    lastAttack: 0,

    x: x - 35,

    y: y - 35,

    target: null

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
      updateProjectiles();
   updateParticles();
   
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

    const enemy = findClosestEnemy(troop);

    troop.target = enemy;

    /* =========================
       IF ENEMY FOUND
    ========================= */

    if(enemy){

        const dx =
        enemy.x - troop.x;

        const dy =
        enemy.y - troop.y;

        const distance =
        Math.sqrt(dx * dx + dy * dy);

        /* ATTACK RANGE */

        if(distance <= troop.range){

            attackTroop(
                troop,
                enemy
            );

            return;

        }

        /* MOVE TOWARD ENEMY */

        const angle =
        Math.atan2(dy, dx);

        troop.x +=
        Math.cos(angle) * troop.speed;

        troop.y +=
        Math.sin(angle) * troop.speed;

    }
    else{

        /* NORMAL ADVANCE */

        if(troop.team === "player"){

            troop.y -= troop.speed;

        }

        if(troop.team === "enemy"){

            troop.y += troop.speed;

        }

    }

    troop.element.style.left =
    `${troop.x}px`;

    troop.element.style.top =
    `${troop.y}px`;

}
/* =========================================
   FIND ENEMIES
========================================= */

function findClosestEnemy(currentTroop){

    let closest = null;

    let closestDistance = Infinity;

    troops.forEach(enemy => {

        if(enemy.team === currentTroop.team)
            return;

        const dx =
        enemy.x - currentTroop.x;

        const dy =
        enemy.y - currentTroop.y;

        const distance =
        Math.sqrt(dx * dx + dy * dy);

        if(distance < closestDistance){

            closestDistance = distance;

            closest = enemy;

        }

    });

    return closest;

}
/* =========================================
   ATTACK SYSTEM
========================================= */

function attackTroop(attacker, victim){

    const now = Date.now();

    if(
        now - attacker.lastAttack
        < attacker.attackSpeed
    ){
        return;
    }

    attacker.lastAttack = now;

    /* =========================
       RANGED ATTACKS
    ========================= */

    if(
        attacker.name === "Arquero" ||
        attacker.name === "Mago" ||
        attacker.name === "Dragón"
    ){

        spawnProjectile(
            attacker,
            victim
        );

    }
    else{

        /* MELEE */

        victim.hp -= attacker.damage;

        hitEffect(victim);

        addLog(
            `${attacker.name} golpeó ${victim.name}`
        );

        if(victim.hp <= 0){

            destroyTroop(victim);

        }

    }

}
/* =========================================
   PROJECTILES
========================================= */

function spawnProjectile(attacker, victim){

    const projectile =
    document.createElement("div");

    projectile.classList.add("projectile");

    /* =========================
       TYPES
    ========================= */

    if(attacker.name === "Arquero"){

        projectile.classList.add("arrow");

    }

    if(attacker.name === "Mago"){

        projectile.classList.add("magic");

    }

    if(attacker.name === "Dragón"){

        projectile.classList.add("fire");

    }

    projectile.style.left =
    `${attacker.x + 25}px`;

    projectile.style.top =
    `${attacker.y + 25}px`;

    board.appendChild(projectile);

    const projectileObj = {

        element: projectile,

        attacker,

        victim,

        damage: attacker.damage,

        x: attacker.x + 25,

        y: attacker.y + 25,

        speed: 5,

        trailTimer: 0

    };

    projectiles.push(projectileObj);

}
/* =========================================
   UPDATE PROJECTILES
========================================= */

function updateProjectiles(){

    projectiles.forEach(projectile => {

        if(
            !projectile.victim ||
            !troops.includes(projectile.victim)
        ){

            projectile.element.remove();

            projectiles =
            projectiles.filter(
                p => p !== projectile
            );

            return;

        }

        const dx =
        projectile.victim.x - projectile.x;

        const dy =
        projectile.victim.y - projectile.y;

        const distance =
        Math.sqrt(dx * dx + dy * dy);

        /* =========================
           TRAIL EFFECT
        ========================= */

        projectile.trailTimer++;

        if(projectile.trailTimer > 2){

            spawnTrailParticle(
                projectile.x,
                projectile.y,
                projectile.attacker.name
            );

            projectile.trailTimer = 0;

        }

        /* =========================
           HIT
        ========================= */

        if(distance < 25){

            projectile.victim.hp -=
            projectile.damage;

            hitEffect(projectile.victim);

            spawnImpactParticles(
                projectile.x,
                projectile.y,
                projectile.attacker.name
            );

            addLog(
                `${projectile.attacker.name} impactó ${projectile.victim.name}`
            );

            if(projectile.victim.hp <= 0){

                destroyTroop(
                    projectile.victim
                );

            }

            projectile.element.remove();

            projectiles =
            projectiles.filter(
                p => p !== projectile
            );

            return;

        }

        /* =========================
           MOVE
        ========================= */

        const angle =
        Math.atan2(dy, dx);

        projectile.x +=
        Math.cos(angle) *
        projectile.speed;

        projectile.y +=
        Math.sin(angle) *
        projectile.speed;

        projectile.element.style.left =
        `${projectile.x}px`;

        projectile.element.style.top =
        `${projectile.y}px`;

    });

}
/* =========================================
   PARTICLES
========================================= */

function spawnImpactParticles(x, y, type){

    for(let i = 0; i < 10; i++){

        createParticle(
            x,
            y,
            type,
            true
        );

    }

}

function spawnTrailParticle(x, y, type){

    createParticle(
        x,
        y,
        type,
        false
    );

}

function createParticle(x, y, type, explosive){

    const particle =
    document.createElement("div");

    particle.classList.add("particle");

    /* COLORS */

    if(type === "Arquero"){

        particle.style.background =
        "#ffe082";

    }

    if(type === "Mago"){

        particle.style.background =
        "#b388ff";

    }

    if(type === "Dragón"){

        particle.style.background =
        "#ff5722";

    }

    const size =
    explosive
    ?
    Math.random() * 12 + 6
    :
    Math.random() * 6 + 3;

    particle.style.width =
    `${size}px`;

    particle.style.height =
    `${size}px`;

    particle.style.left =
    `${x}px`;

    particle.style.top =
    `${y}px`;

    board.appendChild(particle);

    const angle =
    Math.random() * Math.PI * 2;

    const speed =
    explosive
    ?
    Math.random() * 4 + 1
    :
    Math.random() * 2;

    const particleObj = {

        element: particle,

        x,

        y,

        vx:
        Math.cos(angle) * speed,

        vy:
        Math.sin(angle) * speed,

        life:
        explosive ? 40 : 20

    };

    particles.push(particleObj);

}
/* =========================================
   PARTICLES
========================================= */

function spawnImpactParticles(x, y, type){

    for(let i = 0; i < 10; i++){

        createParticle(
            x,
            y,
            type,
            true
        );

    }

}

function spawnTrailParticle(x, y, type){

    createParticle(
        x,
        y,
        type,
        false
    );

}

function createParticle(x, y, type, explosive){

    const particle =
    document.createElement("div");

    particle.classList.add("particle");

    /* COLORS */

    if(type === "Arquero"){

        particle.style.background =
        "#ffe082";

    }

    if(type === "Mago"){

        particle.style.background =
        "#b388ff";

    }

    if(type === "Dragón"){

        particle.style.background =
        "#ff5722";

    }

    const size =
    explosive
    ?
    Math.random() * 12 + 6
    :
    Math.random() * 6 + 3;

    particle.style.width =
    `${size}px`;

    particle.style.height =
    `${size}px`;

    particle.style.left =
    `${x}px`;

    particle.style.top =
    `${y}px`;

    board.appendChild(particle);

    const angle =
    Math.random() * Math.PI * 2;

    const speed =
    explosive
    ?
    Math.random() * 4 + 1
    :
    Math.random() * 2;

    const particleObj = {

        element: particle,

        x,

        y,

        vx:
        Math.cos(angle) * speed,

        vy:
        Math.sin(angle) * speed,

        life:
        explosive ? 40 : 20

    };

    particles.push(particleObj);

}
/* =========================================
   UPDATE PARTICLES
========================================= */

function updateParticles(){

    particles.forEach(particle => {

        particle.x += particle.vx;

        particle.y += particle.vy;

        particle.life--;

        particle.element.style.left =
        `${particle.x}px`;

        particle.element.style.top =
        `${particle.y}px`;

        particle.element.style.opacity =
        particle.life / 40;

        particle.element.style.transform =
        `scale(${particle.life / 20})`;

        if(particle.life <= 0){

            particle.element.remove();

            particles =
            particles.filter(
                p => p !== particle
            );

        }

    });

}
/* =========================================
   HIT EFFECT
========================================= */

function hitEffect(victim){

    victim.element.classList.add("hit");

    setTimeout(() => {

        victim.element.classList.remove("hit");

    }, 120);

}
/* =========================================
   DESTROY TROOP
========================================= */

function destroyTroop(troop){

    addLog(
        `${troop.name} fue destruido`
    );

    troop.element.remove();

    troops =
    troops.filter(t => t !== troop);

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
/* =========================================
   LOGIN
========================================= */

#login-screen{

    position:fixed;

    inset:0;

    background:
    linear-gradient(
        135deg,
        #12002b,
        #000814
    );

    z-index:99999;

    display:flex;
    justify-content:center;
    align-items:center;

}

.login-box{

    width:400px;

    padding:40px;

    border-radius:25px;

    background:
    rgba(255,255,255,0.05);

    backdrop-filter:blur(10px);

    border:
    2px solid #00eaff;

    text-align:center;

    box-shadow:
    0 0 30px rgba(0,234,255,0.4);

}

.login-box h1{

    font-size:3rem;

    color:#7df9ff;

    text-shadow:
    0 0 15px cyan;

}

.login-box p{

    margin:10px 0 30px;

    color:#ffd369;

}

.login-box input{

    width:100%;

    padding:15px;

    border:none;

    border-radius:12px;

    outline:none;

    background:#111827;

    color:white;

    margin-bottom:20px;

    font-size:1rem;

}

.login-box button{

    width:100%;

    padding:15px;

    border:none;

    border-radius:12px;

    cursor:pointer;

    font-weight:bold;

    background:#00eaff;

    color:black;

    transition:0.3s;

}

.login-box button:hover{

    transform:scale(1.03);

    box-shadow:
    0 0 20px cyan;

}
