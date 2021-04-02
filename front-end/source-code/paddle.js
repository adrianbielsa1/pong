import { Game } from "./game.js";
import { KeyboardKeys } from "./keyboard.js";

// The paddle is one of the main entities of the Pong. It can be either
// player-controlled or computer-controlled.
export class Paddle {
    // Establishes where the paddle is, as well as its dimensions.
    constructor(position, dimensions, game) {
        // A paddle is represented by a rectangle, expressed in %s
        // of the `Render`'s dimensions, which the `Render` itself
        // converts to pixels later on.
        this.position = position;
        this.dimensions = dimensions;

        this.game = game;
    }

    // Displays this paddle on the screen, using a `Render` object to do
    // the job.
    draw() {
        const render = this.game.getRender();

        render.rectangle(this.position, this.dimensions, render.theme.paddle());
    }

    // Called when the ball changes its trajectory so the paddle can respond
    // accordingly.
    handleBallTrajectoryChange(ball) {

    }

    // Called when the game's difficulty changes.
    handleGameDifficultyChange() {

    }

    // Returns the paddle's rectangle, which can be used to check for
    // collisions.
    getRectangle() {
        return {
            left: this.position.x,
            right: this.position.x + this.dimensions.width,
            top: this.position.y,
            bottom: this.position.y + this.dimensions.height,
        };
    }
}

// A paddle controlled by a real, physical entity. Its movement is usually
// guided by an external device, such as a keyboard.
export class PlayerPaddle extends Paddle {
    // Extending the `Paddle`'s constructor, a `Keyboard` object must be given
    // so the player can control this paddle's position.
    constructor(position, dimensions, game) {
        // Invoke our parent's constructor.
        super(position, dimensions, game);
    }

    // Calls more specialized functions in charge of updating the components
    // and actions of the paddle.
    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    // Changes this paddle's position.
    updatePosition(deltaTime) {
        // How much % of the background can the paddle travel every second.
        const velocity = {
            x: 100,
            y: 100,
        };

        const deltaTimeInSeconds = deltaTime / 1000;

        const keyboard = this.game.getKeyboard();

        // Check for each arrow key and move accordingly.
        if (keyboard.isPressed(KeyboardKeys.UP)) { this.position.y -= velocity.y * deltaTimeInSeconds; }
        if (keyboard.isPressed(KeyboardKeys.DOWN)) { this.position.y += velocity.y * deltaTimeInSeconds; }

        // OLD: Horizontal movement.
        // if (this.keyboard.isPressed(KeyboardKeys.LEFT)) { this.position.x -= velocity.x * deltaTimeInSeconds; }
        // if (this.keyboard.isPressed(KeyboardKeys.RIGHT)) { this.position.x += velocity.x * deltaTimeInSeconds; }

        // Make sure the paddle doesn't go off-screen.
        if (this.position.x < 0) { this.position.x = 0; }
        if (this.position.x + this.dimensions.width > 100) { this.position.x = 100 - this.dimensions.width; }
        if (this.position.y < 0) { this.position.y = 0; }
        if (this.position.y + this.dimensions.height > 100) { this.position.y = 100 - this.dimensions.height; }
    }
}

// A self-controlled paddle, i.e. governed by the computer.
export class BotPaddle extends Paddle {
    // Extending the `Paddle`'s constructor, a `Ball` object must be given
    // so the computer's paddle can track its position to collide with it.
    constructor(position, dimensions, game, inaccuracy) {
        // Invoke our parent's constructor.
        super(position, dimensions, game);

        // Possible displacement with respect to the expected ball's
        // destination.
        this.inaccuracy = inaccuracy;

        // The distinction about the trajectory of the entity being tracked
        // and actual trajectory that the paddle is following is useful
        // because the paddle might have a variation compared to the tracked
        // entity's destination, yet it needs the tracked entity's trajectory
        // to know when it changes and update the actual trajectory
        // appropiately.
        this.targetTrajectory = {
            origin: { x: NaN, y: NaN },
            destination: { x: NaN, y: NaN },
            elapsed: NaN,
            duration: NaN,
        };

        this.actualTrajectory = {
            origin: { x: NaN, y: NaN },
            destination: { x: NaN, y: NaN },
            elapsed: NaN,
            duration: NaN,
        };
    }

    // Calls more specialized functions in charge of updating the components
    // and actions of the paddle.
    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    // Moves the paddle towards its target destination.
    updatePosition(deltaTime) {
        // TODO: ...
        this.actualTrajectory.elapsed += deltaTime;

        // Just to make sure the paddle doesn't pass the destination. */
        if (this.actualTrajectory.elapsed > this.actualTrajectory.duration) {
            this.actualTrajectory.elapsed = this.actualTrajectory.duration;
        }

        // How much progress has been made (0 means no progress, 1 means the
        // trajectory is complete).
        //
        // TODO: Axis of prevalence?
        const progress = (this.actualTrajectory.elapsed / this.actualTrajectory.duration);
        const distance = (this.actualTrajectory.destination.y - this.actualTrajectory.origin.y);

        // Linear movement.
        this.position.y = this.actualTrajectory.origin.y + distance * progress;

        // Make sure the paddle doesn't go off-screen.
        if (this.position.x < 0) { this.position.x = 0; }
        if (this.position.x + this.dimensions.width > 100) { this.position.x = 100 - this.dimensions.width; }
        if (this.position.y < 0) { this.position.y = 0; }
        if (this.position.y + this.dimensions.height > 100) { this.position.y = 100 - this.dimensions.height; }
    }

    // TODO: Embelish.
    handleBallTrajectoryChange(ball) {
        const relativeDistanceVariation = this.getRelativeDistanceVariationWithBall(ball);

        if (relativeDistanceVariation < 0) {
            this.targetTrajectory = ball.getTrajectory();

            this.actualTrajectory = {
                origin: { x: this.position.x, y: this.position.y },
                destination: { x: this.targetTrajectory.destination.x, y: this.targetTrajectory.destination.y },
                elapsed: 0, // this.targetTrajectory.elapsed,
                duration: this.targetTrajectory.duration,
            }

            // Subtract half of the paddle's dimensions so the ball reaches its
            // center instead of the paddle's top segment.
            this.actualTrajectory.destination.y -= this.dimensions.height / 2;
            this.actualTrajectory.destination.y += Game.random(-this.inaccuracy, this.inaccuracy);
        } else {
            this.targetTrajectory = {
                origin: { x: this.position.x, y: this.position.y },
                // TODO: `x` shouldn't be 50.
                destination: { x: 50, y: 50 },
                elapsed: 0,
                duration: 500, // 0,
            };

            // TODO: Make a copy?
            this.actualTrajectory = this.targetTrajectory;
        }
    }

    // TODO: Embelish.
    handleGameDifficultyChange() {
        const newDifficulty = this.game.getDifficulty().getCurrent();

        this.inaccuracy = newDifficulty.inaccuracy;
    }

    // Returns the distance variation between the ball and the paddle.
    // This value represents the behavior of the distance between the objects
    // over time. If it is negative, then the distance will shrink; if it is
    // positive, it will grow; otherwise, it will remain the same.
    //
    // TODO: Find a better name?
    getRelativeDistanceVariationWithBall(ball) {
        const relativeVelocity = {
            x: ball.getVelocity().x - 0, // 0 is the paddle's velocity on X.
            y: ball.getVelocity().y - 0, // 0 is the paddle's velocity on Y.
        };

        const relativePosition = {
            x: ball.getPosition().x - this.position.x,
            y: ball.getPosition().y - this.position.y,
        };

        // NOTE: This used to be a dot product, however, there were certain
        // situations where the calculation would yield that the ball
        // is moving towards the paddle when it's actually the opposite.
        // Since I'm a little bit lazy now after refactoring the whole
        // codebase, I've trimmed the result to the X axis only, which
        // works correctly.
        return (relativeVelocity.x * relativePosition.x); // + (relativeVelocity.y * relativePosition.y);
    }
}
