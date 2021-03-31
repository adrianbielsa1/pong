import { Ball } from "./ball.js";
import { Game, GameSides } from "./game.js";
import { Render } from "./render.js";
import { BotPaddle, PlayerPaddle } from "./paddle.js";

// Base class used to build concrete screens.
export class Screen {
    constructor() {

    }

    draw() {

    }

    update() {

    }
};

// A screen where the player can change the game's difficulty, the side
// they play, etc.
export class MenuScreen extends Screen {
    constructor(game) {
        // Invoke our parent's constructor.
        super();

        // Store objects so we can use them later.
        this.game = game;
        this.images = new MenuScreenImages(game);

        this.elements = [
            { image: "left-arrow.png", position: { x: 35, y: 47.5 }, dimensions: { width: 3, height: 5.31 } },
        ];
    }

    draw() {
        const render = this.game.getRender();

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        for (const element of this.elements) {
            const elementData = this.images.get(element.image);

            // Ensure the image is loaded.
            if (!(elementData === null)) {
                render.image(elementData, element.position, element.dimensions);
            }
        }
    }
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
        const paddleDimension = { width: 0.25, height: 10 };

        // Create paddles.
        this.paddles = [
            new PlayerPaddle({ x: 0, y: 50 }, paddleDimension, this.game),

            // TODO: "7" is just a placeholder number.
            new BotPaddle({ x: 99.75, y: 50 }, paddleDimension, this.game, 7),
        ];

        // Create ball.
        this.ball = new Ball(
            ballPosition, ballSpeed, ballDirection,
            this.game, this.paddles
        );
    }

    draw() {
        const render = this.game.getRender();

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        // Draw scores.
        render.text(
            { x: 10, y: 50 }, 0.1, "red", this.game.scores[GameSides.LEFT], "Arial", "center"
        );

        render.text(
            { x: 90, y: 50 }, 0.1, "red", this.game.scores[GameSides.RIGHT], "Arial", "center"
        );

        // Draw all objects.
        this.ball.draw();
        this.paddles.forEach(paddle => paddle.draw());
    }

    update(deltaTime) {
        // NOTE: The `Ball` object updates the paddles internally.
        this.ball.update(deltaTime);
    }
};
