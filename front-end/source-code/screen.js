import { Ball } from "./ball.js";
import { Game, GameSides } from "./game.js";
import { Render } from "./render.js";
import { BotPaddle, PlayerPaddle } from "./paddle.js";

// Base class used to build concrete screens.
export class Screen {
    // To set up the screen.
    constructor() {}

    // To display the screen's object.
    draw() {}

    // To update screen-related objects.
    update(deltaTime) {}

    // Called whenever the site's visibility is changed.
    handleSiteVisibilityChange() {}

    // Called whenever the game's difficulty is changed.
    handleGameDifficultyChange() {}

    // Called whenever the game's screen is changed.
    handleGameScreenChange(newScreen) {}
};

// The screen where the player and the AI play against each other.
export class IngameScreen extends Screen {
    constructor(game) {
        // Invoke our parent's constructor.
        super();

        // Store objects so we can use them later.
        this.game = game;

        // Generate initial values for the ball.
        //
        // NOTE: This is just a commodity so I can remember better
        // what is the meaning of each value, since Javascript doesn't
        // support named parameters (as of the time of writing).
        const ballPosition = { x: 50, y: 50 };
        const ballSpeed = 25;
        const ballDirection = Game.random(0, 2 * Math.PI);

        // Generate initial values for the paddles.
        //
        // TODO: Isn't kind of bad sharing the same dimensions for every
        // paddle? They should copy the object internally.
        const paddleDimension = { width: 0.5, height: 10 };

        // Create paddles.
        this.paddles = [
            new PlayerPaddle({ x: 0, y: 45 }, paddleDimension, this.game),

            // TODO: "7" is just a placeholder number.
            new BotPaddle({ x: 99.75, y: 45 }, paddleDimension, this.game, 7),
        ];

        // Create ball.
        this.ball = new Ball(
            ballPosition, ballSpeed, ballDirection,
            this.game, this.paddles
        );
    }

    draw() {
        const render = this.game.getRender();
        const difficulty = this.game.getDifficulty().getCurrent().description;

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        // Draw scores.
        render.text(
            { x: 40, y: 52.5 }, 0.05, render.theme.texts(), this.game.scores[GameSides.LEFT], "Arial", "center"
        );

        render.text(
            { x: 60, y: 52.5 }, 0.05, render.theme.texts(), this.game.scores[GameSides.RIGHT], "Arial", "center"
        );

        // Draw difficulty.
        render.text(
            { x: 50, y: 5 }, 0.02, render.theme.texts(), "Difficulty: " + difficulty, "Arial", "center"
        );

        // Draw all objects.
        this.ball.draw();
        this.paddles.forEach(paddle => paddle.draw());
    }

    update(deltaTime) {
        // NOTE: The `Ball` object updates the paddles internally.
        this.ball.update(deltaTime);
    }

    handleGameDifficultyChange() {
        this.paddles.forEach(p => { p.handleGameDifficultyChange(); });
    }
};

export class HelpScreen extends Screen {
    constructor(game) {
        // Invoke our parent's constructor.
        super();

        // Store objects so we can use them later.
        this.game = game;
    }

    draw() {
        const render = this.game.getRender();

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        render.text(
            { x: 50, y: 45 }, 0.02, render.theme.texts(), "Move your paddle using the arrow keys or WASD!", "Arial", "center"
        );

        render.text(
            { x: 50, y: 50 }, 0.02, render.theme.texts(), "To increase the difficulty, press the + key.", "Arial", "center"
        );

        render.text(
            { x: 50, y: 55 }, 0.02, render.theme.texts(), "To decrease it, press the - key.", "Arial", "center"
        );
    }
}
