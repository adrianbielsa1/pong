import { Ball } from "./ball.js";
import { BotPaddle, PlayerPaddle } from "./paddle.js";
import { CanvasRender } from "./render.js";
import { WindowKeyboard } from "./keyboard.js";

/*
    The game is a container of all the elements that make up the Pong
    itself. It serves the purpose of preparing, running and terminating
    it.
*/
export class Game {
    constructor() {
        /* A timestamp of the last time the `run` method was called. */
        this.lastTickTimestamp = NaN;

        /* Determines if the current game tick should be ignored. */
        this.ignoreTick = false;

        /* External HTML elements required to set up the render. */
        const mainCanvas = document.getElementById("mainCanvas");
        const mainCanvasContext = mainCanvas.getContext("2d");

        this.render = new CanvasRender(mainCanvas, mainCanvasContext);
        this.keyboard = new WindowKeyboard();

        this.scores = {};

        for (const [sideKey, sideValue] of Object.entries(GameSides)) {
            this.scores[sideValue] = 0;
        }

        /*
            Generate a random initial angle for the ball, and give it
            an initial speed.

            NOTE: Since `Math.random` isn't actually random, it's very
            likely that reloading the page over and over will yield
            the same sequence of random numbers.

            NOTE: This is just a commodity so I can remember better
            what is the meaning of each value, since Javascript doesn't
            support named parameters (as of the time of writing).
        */
        const ballDirection = Math.random(0, 2 * Math.PI);
        const ballSpeed = 25;

        this.ball = new Ball({ x: 50, y: 50 }, ballSpeed, ballDirection, this, this.render);

        this.paddles = [
            new PlayerPaddle({ x: 0, y: 50 }, { width: 0.25, height: 10 }, this.render, this.keyboard),
            // new PlayerPaddle({ x: 0, y: 20 }, { width: 1, height: 10 }, this.render),
            new BotPaddle({ x: 99.75, y: 50 }, { width: 0.25, height: 10 }, this.render, this.ball),
        ];

        this.ball.hackyPlugPaddles(this.paddles);

        /* To be notified when the tab's visiblity changes. */
        document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this), false);
    }

    /* Updates the game continuously. */
    run(currentTickTimestamp) {
        /*
            Initialize the `lastTickTimestamp` for the first time, otherwise
            we'd probably get a really big value when calculating the time
            elapsed for the first time.
        */
        if (isNaN(this.lastTickTimestamp)) {
            this.lastTickTimestamp = currentTickTimestamp;
        }

        /*
            Calculate how much time has passed since the last call to this
            method.
        */
        const deltaTime = currentTickTimestamp - this.lastTickTimestamp;

        /* Update last call's timestamp. */
        this.lastTickTimestamp = currentTickTimestamp;

        if (!this.ignoreTick) {
            /* Do actual game-related actions. */
            this.update(deltaTime);
            this.draw();
        } else {
            /* Tick successfully ignored. */
            this.ignoreTick = false;
        }

        /* Make sure this method is called on the next frame. */
        window.requestAnimationFrame(this.run.bind(this));
    }

    /* Displays all entities on the screen. */
    draw() {
        /* Remove the previous frame from the screen. */
        this.render.clear(this.render.theme.background());

        /* Draw scores. */
        this.render.text(
            { x: 10, y: 50 }, 0.1, "red", this.scores[GameSides.LEFT], "Arial"
        );

        this.render.text(
            { x: 80, y: 50 }, 0.1, "red", this.scores[GameSides.RIGHT], "Arial"
        );

        /* Draw all objects. */
        this.ball.draw();
        this.paddles.forEach(paddle => paddle.draw());
    }

    /* Updates all entities, executing actions like movement. */
    update(deltaTime) {
        this.ball.update(deltaTime);
        this.paddles.forEach(paddle => paddle.update(deltaTime));
    }

    /*
        Increases the points of one of the paddles. Called when the ball
        passes through a `side`: either left or right.
    */
    score(side) {
        this.scores[side] += 1;
    }

    /*
        Returns either `true` or `false`, depending on whether the game's
        tab has focus or not.
    */
    handleVisibilityChange() {
        if (document.hidden) {
            /*
                When the tab loses visibility, we ignore a tick. This is
                done to prevent having to deal with real big `deltaTime`
                values, which would cause more problems than solutions.
            */
            this.ignoreTick = true;
        }
    }

    /*
        Helper function to get a random number between two values.
        CREDITS: The `developer.mozilla.org` website.
    */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
}

export const GameSides = {
    LEFT: 0,
    RIGHT: 1,
};

/* TODO: ... */
Object.freeze(GameSides);
