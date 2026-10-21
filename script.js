
const disksInput = document.getElementById("disks");
const modeInput = document.getElementById("mode");

const rods = {
    A: document.getElementById("A"),
    B: document.getElementById("B"),
    C: document.getElementById("C")
};

let towers;
let moves;
let currentMove;
let timer = null;
let operationStack = [];

function createRecursiveMoves(n, from, aux, to, result) {
    if (n === 1) {
        result.push({ from, to, disk: 1 });
        return;
    }

    createRecursiveMoves(n - 1, from, to, aux, result);

    result.push({ from, to, disk: n });

    createRecursiveMoves(n - 1, aux, from, to, result);
}

function createStackMoves(n, from, aux, to, result) {
    const stack = [
        { n, from, aux, to, stage: 0 }
    ];

    while (stack.length > 0) {
        const task = stack[stack.length - 1];

        if (task.n === 1) {
            result.push({
                from: task.from,
                to: task.to,
                disk: 1
            });

            stack.pop();
        } else if (task.stage === 0) {
            task.stage = 1;

            stack.push({
                n: task.n - 1,
                from: task.from,
                aux: task.to,
                to: task.aux,
                stage: 0
            });
        } else if (task.stage === 1) {
            result.push({
                from: task.from,
                to: task.to,
                disk: task.n
            });

            task.stage = 2;
        } else if (task.stage === 2) {
            task.stage = 3;

            stack.push({
                n: task.n - 1,
                from: task.aux,
                aux: task.from,
                to: task.to,
                stage: 0
            });
        } else {
            stack.pop();
        }
    }
}

function renderTowers() {
    for (const name of ["A", "B", "C"]) {
        rods[name].innerHTML = "";

        towers[name].forEach(disk => {
            const element = document.createElement("div");

            element.className = "disk";
            element.textContent = disk;
            element.style.width =
                (35 + disk * (45 / towers.A.length)) + "%";

            rods[name].appendChild(element);
        });
    }
}

function showStack() {
    const output = document.getElementById("stack");

    if (modeInput.value === "stack") {
        output.textContent =
            "Explicit stack method\n" +
            "Total operations: " + currentMove +
            "\nRemaining moves: " +
            (moves.length - currentMove);
    } else {
        output.textContent =
            "Recursive method\n" +
            "Function calls generate smaller problems.\n" +
            "Completed moves: " + currentMove;
    }
}

function updateScreen() {
    document.getElementById("moves").textContent = currentMove;

    document.getElementById("minimum").textContent =
        Math.pow(2, Number(disksInput.value)) - 1;

    document.getElementById("status").textContent =
        currentMove === moves.length
            ? "Puzzle solved!"
            : "Move " + currentMove + " of " + moves.length;

    showStack();
}

function makeMove() {
    if (currentMove >= moves.length) {
        stopPlaying();
        return;
    }

    const move = moves[currentMove];
    const disk = towers[move.from].pop();

    if (disk !== move.disk) {
        stopPlaying();
        return;
    }

    towers[move.to].push(disk);
    currentMove++;

    const item = document.createElement("li");
    item.textContent =
        "Move disk " + move.disk +
        " from " + move.from + " to " + move.to;

    document.getElementById("history").appendChild(item);

    document.getElementById("explanation").textContent =
        "Move disk " + move.disk +
        " from rod " + move.from +
        " to rod " + move.to + ".";

    renderTowers();
    updateScreen();

    if (currentMove === moves.length) {
        stopPlaying();
    }
}

function stopPlaying() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    document.getElementById("play").textContent = "Play";
}

function resetPuzzle() {
    stopPlaying();

    const n = Number(disksInput.value);

    towers = { A: [], B: [], C: [] };

    for (let disk = n; disk >= 1; disk--) {
        towers.A.push(disk);
    }

    moves = [];
    currentMove = 0;
    operationStack = [];

    if (modeInput.value === "recursive") {
        createRecursiveMoves(n, "A", "B", "C", moves);
    } else {
        createStackMoves(n, "A", "B", "C", moves);
    }

    document.getElementById("history").innerHTML = "";
    document.getElementById("explanation").textContent =
        modeInput.value === "recursive"
            ? "The recursive algorithm breaks the problem into smaller problems."
            : "The stack algorithm stores pending tasks explicitly.";

    renderTowers();
    updateScreen();
}

document.getElementById("next").addEventListener("click", makeMove);

document.getElementById("play").addEventListener("click", function () {
    if (timer !== null) {
        stopPlaying();
        return;
    }

    if (currentMove >= moves.length) {
        resetPuzzle();
    }

    document.getElementById("play").textContent = "Pause";

    timer = setInterval(makeMove, 900);
});

document.getElementById("reset").addEventListener("click", resetPuzzle);
disksInput.addEventListener("change", resetPuzzle);
modeInput.addEventListener("change", resetPuzzle);

resetPuzzle();
