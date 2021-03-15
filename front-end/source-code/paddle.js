import { KeyboardKeys } from "./keyboard.js";

/*
    The paddle is one of the main entities of the Pong. It can be either
    player-controlled or computer-controlled.
*/
export class Paddle {
    /*
        Establishes where the paddle is, as well as its dimensions, and
        links a `Render` object to draw it.
    */
    constructor(position, dimensions, render) {
        /*
            A paddle is represented by a rectangle, expressed in %s
            of the `Render`'s dimensions, which the `Render` itself
            converts to pixels later on.
        */
        this.position = position;
        this.dimensions = dimensions;

        /* Used to draw the paddle on the screen. */
        this.render = render;
    }

    /*
        Displays this paddle on the screen, using a `Render` object to do
        the job.
    */
    draw() {
        this.render.rectangle(this.position, this.dimensions, this.render.theme.paddle());
    }
}

/*
    A paddle controlled by a real, physical entity. Its movement is usually
    guided by an external device, such as a keyboard.
*/
export class PlayerPaddle extends Paddle {
    /*
        Extending the `Paddle`'s constructor, a `Keyboard` object must be given
        so the player can control this paddle's position.
    */
    constructor(position, dimensions, render, keyboard) {
        /* Invoke our parent's constructor. */
        super(position, dimensions, render);

        /* Reference to the keyboard. */
        this.keyboard = keyboard;
    }

    /*
        Calls more specialized functions in charge of updating the components
        and actions of the paddle.
    */
    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    /* Changes this paddle's position. */
    updatePosition(deltaTime) {
        /* How much % of the background can the paddle travel every second. */
        const velocity = {
            x: 100,
            y: 100,
        };

        const deltaTimeInSeconds = deltaTime / 1000;

        /* Check for each arrow key and move accordingly. */
        if (this.keyboard.isPressed(KeyboardKeys.UP)) { this.position.y -= velocity.y * deltaTimeInSeconds; }
        if (this.keyboard.isPressed(KeyboardKeys.DOWN)) { this.position.y += velocity.y * deltaTimeInSeconds; }

        /*
        if (this.keyboard.isPressed(KeyboardKeys.LEFT)) { this.position.x -= velocity.x * deltaTimeInSeconds; }
        if (this.keyboard.isPressed(KeyboardKeys.RIGHT)) { this.position.x += velocity.x * deltaTimeInSeconds; }
        */

        /* Make sure the paddle doesn't go off-screen. */
        if (this.position.x < 0) { this.position.x = 0; }
        if (this.position.x + this.dimensions.width > 100) { this.position.x = 100 - this.dimensions.width; }
        if (this.position.y < 0) { this.position.y = 0; }
        if (this.position.y + this.dimensions.height > 100) { this.position.y = 100 - this.dimensions.height; }
    }
}

/* A self-controlled paddle, i.e. governed by the computer. */
export class BotPaddle extends Paddle {
    /*
        Extending the `Paddle`'s constructor, a `Ball` object must be given
        so the computer's paddle can track its position to collide with it.
    */
    constructor(position, dimensions, render, ball) {
        /* Invoke our parent's constructor. */
        super(position, dimensions, render);

        /* Ball to track (when it is the target). */
        this.ball = ball;

        /* What the paddle is currently following. */
        this.target = BotPaddleTargets.NONE;

        /*
            The distinction about the trajectory of the entity being tracked
            and actual trajectory that the paddle is following is useful
            because the paddle might have a variation compared to the tracked
            entity's destination, yet it needs the tracked entity's trajectory
            to know when it changes and update the actual trajectory
            appropiately.
        */
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

    /*
        Calls more specialized functions in charge of updating the components
        and actions of the paddle.
    */
    update(deltaTime) {
        this.updateTarget();
        this.updatePosition(deltaTime);
    }

    /*
        Checks if there are reasons to change this paddle's target, and
        updates it accordingly.
    */
    updateTarget() {
        const relativeDistanceVariation = this.getRelativeDistanceVariationWithBall();

        /*
            NOTE: If the `relativeDistanceVariation` between the entities is 0,
            they're not moving away nor closer to each other.

            TODO: Maybe handle the case when `relativeDistanceVariation` is 0?
            It could happen if the ball moves on the same axis as the paddle.
        */
        if (relativeDistanceVariation < 0) {
            /*
                The distance between the entities is decreasing; they're moving
                towards each other.
            */
            this.setTarget(BotPaddleTargets.BALL);
        } else if (relativeDistanceVariation > 0) {
            /* The distance between the entities is increasing. */
            this.setTarget(BotPaddleTargets.CENTER);
        }
    }

    /* Moves the paddle towards its target destination. */
    updatePosition(deltaTime) {
        /* TODO: ... */
        this.actualTrajectory.elapsed += deltaTime;

        /* Just to make sure the paddle doesn't pass the destination. */
        if (this.actualTrajectory.elapsed > this.actualTrajectory.duration) {
            this.actualTrajectory.elapsed = this.actualTrajectory.duration;
        }

        /*
            How much progress has been made (0 means no progress, 1 means the
            trajectory is complete).

            TODO: Axis of prevalence?
        */
        const progress = (this.actualTrajectory.elapsed / this.actualTrajectory.duration);
        const distance = (this.actualTrajectory.destination.y - this.actualTrajectory.origin.y);

        /* Linear movement. */
        this.position.y = this.actualTrajectory.origin.y + distance * progress;

        /* Make sure the paddle doesn't go off-screen. */
        if (this.position.x < 0) { this.position.x = 0; }
        if (this.position.x + this.dimensions.width > 100) { this.position.x = 100 - this.dimensions.width; }
        if (this.position.y < 0) { this.position.y = 0; }
        if (this.position.y + this.dimensions.height > 100) { this.position.y = 100 - this.dimensions.height; }
    }

    /* Changes the paddle's target, updating variables accordingly. */
    setTarget(newTarget) {
        /* Just some syntax sugar, so the code below is easier to follow. */
        const newTrajectory = this.getTargetTrajectory(newTarget);
        const newOrigin = newTrajectory.origin;
        const newDestination = newTrajectory.destination;

        const sameTarget = (this.target == newTarget);
        const sameDestination = (
            this.targetTrajectory.destination.x == newDestination.x
        ) && (
            this.targetTrajectory.destination.y == newDestination.y
        );
        const sameDuration = (this.targetTrajectory.duration == newTrajectory.duration);

        /*
            Make sure the paddle is tracking the same entity, and
            that the trajectory is also the same. This way, we prevent
            unnecessary calculations.

            TODO: Should I check the trajectory's elapsed time too?
        */
        if (!sameTarget || !sameDestination || !sameDuration) {
            /* Update the target. */
            this.target = newTarget;

            /*
                TODO: Just in case, I'm constructing new objects so, for
                example, `origin` isn't updated when the `position` is
                (i.e. a manual deep copy). Can this be cleaner?
            */

            /*
                Copy the target entity's trajectory so we can compare it
                later and detect changes.
            */
            this.targetTrajectory = {
                origin: { x: newOrigin.x, y: newOrigin.y },
                destination: { x: newDestination.x, y: newDestination. y},
                elapsed: 0,
                duration: newTrajectory.duration,
            };

            /*
                Now for the actual trajectory that the paddle will be
                complete.
            */
            this.actualTrajectory = {
                origin: { x: this.position.x, y: this.position.y },
                destination: { x: newDestination.x, y: newDestination.y },
                elapsed: 0,
                duration: newTrajectory.duration,
            };

            /*
                First we move the destination a bit so the it's center of
                the paddle what reaches said destination, instead of the
                paddle's top border (which is the paddle's actual "position").
            */
            this.actualTrajectory.destination.y -= this.dimensions.height / 2;
        }
    }

    /*
        Returns a trajectory tracking the specified `target`.
        TODO: Fix, complete, check.
    */
    getTargetTrajectory(target) {
        switch (target) {
            case BotPaddleTargets.NONE:
                return {
                    origin: { x: NaN, y: NaN },
                    destination: { x: NaN, y: NaN },
                    elapsed: NaN,
                    duration: NaN,
                };
            case BotPaddleTargets.BALL:
                return this.ball.getTrajectory();
            case BotPaddleTargets.CENTER:
                /* TODO: 500 is just a placeholder for a more adequate number. */
                return {
                    origin: { x: this.position.x, y: this.position.y },
                    destination: { x: 50, y: 50 },
                    elapsed: 0,
                    duration: 500,
                };
        }
    }

    /*
        Returns the distance variation between the ball and the paddle.
        This value represents the behavior of the distance between the objects
        over time. If it is negative, then the distance will shrink; if it is
        positive, it will grow; otherwise, it will remain the same.

        TODO: Find a better name?
    */
    getRelativeDistanceVariationWithBall() {
        const relativeVelocity = {
            x: this.ball.getVelocity().x - 0, /* 0 is the paddle's velocity on X. */
            y: this.ball.getVelocity().y - 0, /* 0 is the paddle's velocity on Y. */
        };

        const relativePosition = {
            x: this.ball.getPosition().x - this.position.x,
            y: this.ball.getPosition().y - this.position.y,
        };

        /*
            NOTE: This used to be a dot product, however, there were certain
            situations where the calculation would yield that the ball
            is moving towards the paddle when it's actually the opposite.
            Since I'm a little bit lazy now after refactoring the whole
            codebase, I've trimmed the result to the X axis only, which
            works correctly.
        */
        return (relativeVelocity.x * relativePosition.x); // + (relativeVelocity.y * relativePosition.y);
    }
}

/*
    List of all possible "entities" or "locations" that the paddle might
    track.
*/
const BotPaddleTargets = {
    NONE: 0,
    BALL: 1,
    CENTER: 2,
};

/*
    Freeze the object so its properties cannot be modified.
    TODO: Can't this be just `BotPaddleTargets.freeze()`?
*/
Object.freeze(BotPaddleTargets);
