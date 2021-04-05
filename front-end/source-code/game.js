import { CanvasRender } from "./render.js";
import { WindowKeyboard, KeyboardKeys } from "./keyboard.js";
import { HelpScreen, IngameScreen } from "./screen.js";

// The game is a container of all the elements that make up the Pong
// itself. It serves the purpose of preparing, running and terminating
// it.
export class Game {
    constructor() {
        // A timestamp of the last time the `run` method was called.
        this.lastTickTimestamp = NaN;

        // Determines if the current game tick should be ignored.
        this.ignoreTick = false;

        // External HTML elements required to set up the render.
        const mainCanvas = document.getElementById("mainCanvas");
        const mainCanvasContext = mainCanvas.getContext("2d");

        this.render = new CanvasRender(mainCanvas, mainCanvasContext);
        this.keyboard = new WindowKeyboard();
        this.difficulty = new GameDifficulty(this);

        this.scores = {};

        for (const [sideKey, sideValue] of Object.entries(GameSides)) {
            this.scores[sideValue] = 0;
        }

        // To be notified when the tab's visiblity changes.
        document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this), false);

        // To be notified when the current screen should be changed.
        //
        // NOTE: This doesn't create new screens every time the event is raised,
        // instead, it re-uses the same screens that were created the first time.
        document.addEventListener("queryHelpScreenShow", this.handleGameScreenChange.bind(this, new HelpScreen(this)));
        document.addEventListener("queryIngameScreenShow", this.handleGameScreenChange.bind(this, new IngameScreen(this)));

        // Keeps track of the current screen being shown, which might change
        // during the course of the game.
        this.currentScreen = new IngameScreen(this); // new MenuScreen(this);
    }

    // Updates the game continuously.
    run(currentTickTimestamp) {
        // Initialize the `lastTickTimestamp` for the first time, otherwise
        // we'd probably get a really big value when calculating the time
        // elapsed for the first time.
        if (isNaN(this.lastTickTimestamp)) {
            this.lastTickTimestamp = currentTickTimestamp;
        }

        // Calculate how much time has passed since the last call to this
        // method.
        const deltaTime = currentTickTimestamp - this.lastTickTimestamp;

        // Update last call's timestamp.
        this.lastTickTimestamp = currentTickTimestamp;

        if (!this.ignoreTick) {
            // Do actual game-related actions.
            this.update(deltaTime);
            this.draw();
        } else {
            // Tick successfully ignored.
            this.ignoreTick = false;
        }

        // Make sure this method is called on the next frame.
        window.requestAnimationFrame(this.run.bind(this));
    }

    // Displays all entities on the screen.
    draw() {
        this.currentScreen.draw();
    }

    // Updates all entities, executing actions like movement.
    update(deltaTime) {
        this.difficulty.update(deltaTime);
        this.currentScreen.update(deltaTime);
    }

    // Increases the points of one of the paddles. Called when the ball
    // passes through a `side`: either left or right.
    score(side) {
        this.scores[side] += 1;
    }

    // Returns either `true` or `false`, depending on whether the game's
    // tab has focus or not.
    handleVisibilityChange() {
        if (document.hidden) {
            // When the tab loses visibility, we ignore a tick. This is
            // done to prevent having to deal with real big `deltaTime`
            // values, which would cause more problems than solutions.
            this.ignoreTick = true;
        }
    }

    // Called when the game's difficulty is changed.
    handleGameDifficultyChange() {
        this.currentScreen.handleGameDifficultyChange();
    }

    // Called whenever the game's screen is changed.
    handleGameScreenChange(newScreen) {
        this.currentScreen = newScreen;
    }

    // Returns a fully-constructed `Render` object which can be used to
    // display shapes on the screen.
    getRender() {
        return this.render;
    }

    // Returns a fully-constructed `Keyboard` object which can be used to
    // gather input from the player.
    getKeyboard() {
        return this.keyboard;
    }

    // Returns a fully-constructed `GameDifficulty` object.
    getDifficulty() {
        return this.difficulty;
    }

    // Helper function to get a random number between two values.
    //
    // CREDITS: The `developer.mozilla.org` website.
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
}

export class GameDifficulty {
    constructor(game) {
        this.game = game;

        this.current = 2; // Medium difficulty level.
        this.levels = [
            { description: "Beginner", inaccuracy: 14 },
            { description: "Easy", inaccuracy: 12 },
            { description: "Medium", inaccuracy: 10 },
            { description: "Hard", inaccuracy: 8 },
            { description: "Nightmare", inaccuracy: 6 },
            { description: "Impossible", inaccuracy: 0 },
        ];

        this.timeUntilNextChange = 0;
    }

    update(deltaTime) {
        const keyboard = this.game.getKeyboard();
        const previous = this.current;

        this.timeUntilNextChange -= deltaTime;

        if (this.timeUntilNextChange > 0) { return; }

        if (keyboard.isPressed(KeyboardKeys.ADD)) { this.current += 1; }
        if (keyboard.isPressed(KeyboardKeys.SUBTRACT)) { this.current -= 1; }

        if (this.current < 0) { this.current = 0; }
        if (this.current == this.levels.length) { this.current = this.levels.length - 1; }

        if (this.current != previous) {
            this.game.handleGameDifficultyChange();
            this.timeUntilNextChange = 175;
        }
    }

    getCurrent() {
        return this.levels[this.current];
    }
};

export const GameSides = {
    LEFT: 0,
    RIGHT: 1,
};

// TODO: ...
Object.freeze(GameSides);
