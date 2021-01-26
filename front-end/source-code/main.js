import { Keyboard, KeyboardKeys } from "./keyboard.js";
import { Paddle } from "./paddle.js";
import * as theme from "./theme.js";

/* External HTML elements that we will be handling. */
const mainCanvas = document.getElementById("mainCanvas");
const mainCanvasContext = mainCanvas.getContext("2d");

/* Paddles. */
const leftPaddle = new Paddle();

/* Keyboard. */
const keyboard = new Keyboard();

/* Used to calculate the delta time between frames. */
var lastTickTimestamp = undefined;

/* Keeps the canvas as big as the window. */
function onResize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

/* Prepares keyboard/mouse callbacks, among other things. */
function prepare() {
    /* NOTE: A call to `bind` is added because otherwise, when using `this` inside
       the `Keyboard` class, it would refer to the event itself, thus becoming
       unusable. */
    window.addEventListener("keydown", keyboard.onKeyDown.bind(keyboard));
    window.addEventListener("keyup", keyboard.onKeyUp.bind(keyboard));
    window.addEventListener("resize", onResize);

    /* Call `onResize` for the first time so the canvas takes up the whole page. */
    onResize();
}

/* Moves players if necessary. */
function update(deltaTime) {
    /* The paddle moves 1% of the canvas' height every 10ms (at most). */
    const variation = mainCanvas.height * (deltaTime / 10) * 0.01;

    if (keyboard.isPressed(KeyboardKeys.Up)) {
        leftPaddle.y -= variation;
    }

    if (keyboard.isPressed(KeyboardKeys.Down)) {
        leftPaddle.y += variation;
    }

    const paddleAABB = leftPaddle.aabb;
    const canvasAABB = mainCanvas.getBoundingClientRect();

    /* Prevent the paddle from going over the top. */
    if (paddleAABB.top < canvasAABB.top) {
        leftPaddle.y -= (paddleAABB.top - canvasAABB.top);
    }

    /* Prevent the paddle from from going below the bottom. */
    if (paddleAABB.bottom > canvasAABB.bottom) {
        leftPaddle.y += (canvasAABB.bottom - paddleAABB.bottom);
    }
}

/* Repaints the whole screen. */
function draw(deltaTime) {
    /* Remove everything from the screen. */
    mainCanvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    /* Paint the background. */
    mainCanvasContext.fillStyle = theme.background();
    mainCanvasContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    /* Get the paddle's AABB. */
    const paddleAABB = leftPaddle.aabb;
    const paddleWidth = paddleAABB.right - paddleAABB.left;
    const paddleHeight = paddleAABB.bottom - paddleAABB.top;

    /* Paint the left paddle. */
    mainCanvasContext.fillStyle = theme.paddle();
    mainCanvasContext.fillRect(paddleAABB.left, paddleAABB.top, paddleWidth, paddleHeight);
}

/* Game loop. */
function run(currentTickTimestamp) {
    /* Initialize the timestamp for the first time. */
    if (lastTickTimestamp == undefined) {
        lastTickTimestamp = currentTickTimestamp;
    }

    /* Calculate how much time passed between each tick and update last timestamp. */
    const deltaTime = currentTickTimestamp - lastTickTimestamp;
    lastTickTimestamp = currentTickTimestamp;

    update(deltaTime);
    draw(deltaTime);

    /* Push the next game loop tick request. */
    window.requestAnimationFrame(run);
}

/* Set up everything and request the browser to run the game loop for the first time. */
prepare();
window.requestAnimationFrame(run);
