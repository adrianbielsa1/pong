import { Game, GameSides } from "./game.js";
import { Collision } from "./collision.js";

/*
    The paddle is one of the main entities of the Pong. It moves from side
    to side with increasing speed, until a paddle fails to stop it, making
    the game end.
*/
export class Ball {
    /*
        Establishes where the ball is, as well as its initial direction and
        speed.
    */
    constructor(position, speed, direction, game, render, paddles) {
        /* Information about movement. */
        this.position = position;
        this.speed = speed;
        this.direction = direction;

        /* Used to notify about scoring events. */
        this.game = game;

        /* Used to draw the ball on the screen. */
        this.render = render;

        /* Information about the ball's movement. */
        this.trajectory = {
            origin: { x: NaN, y: NaN },
            destination: { x: NaN, y: NaN },
            elapsed: NaN,
            duration: NaN,
        };

        this.paddles = paddles;

        /* Calculate the ball's trajectory for the first time. */
        this.predict();
    }

    /*
        Displays the ball on the screen, using a `Render` object to do the
        job.
    */
    draw() {
        /* TODO: Check radius. */
        this.render.circle(this.position, 7, this.render.theme.ball());
    }

    /* Updates the ball, applying actions like moving it. */
    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    /*
        Changes the ball's position, moving it across the screen and raising
        the appropriate events if something happens, such as a collision.
    */
    updatePosition(deltaTime) {
        while (deltaTime > 0) {
            // How long until we reach our target.
            const remainingTime = this.trajectory.duration - this.trajectory.elapsed;

            // The `movementTime` will be, at most, the `remainingTime`.
            // Otherwise, the ball would move beyond its target.
            const movementTime = remainingTime > deltaTime ? deltaTime : remainingTime;

            // Where the ball will be once this movement is over.
            const futurePosition = this.getFuturePosition(movementTime);

            // A line from the ball's current position to the ball's future
            // position.
            const segment = {
                start: this.position,
                end: futurePosition,
            };

            // Move all paddles towards their target.
            this.paddles.forEach(p => p.updatePosition(movementTime));

            // Count this movement.
            this.trajectory.elapsed += movementTime;

            // Get paddles that might collide with the ball.
            const collidablePaddles = this.paddles.filter(p => {
                const rectangle = p.getRectangle();

                return this.collidesWith(segment, rectangle);
            });

            if (collidablePaddles.length > 0) {
                // There is at least one paddle that might collide with the
                // ball. We act as if only one of them collides.
                //
                // TODO: Consider not only one but all of the collidable
                // paddles?
                this.reflect(true, true);
                this.predict();
            } else {
                // See if the ball has reached one of the borders of the
                // screen.
                if (futurePosition.x == 0) {
                    this.game.score(GameSides.RIGHT);
                    this.reset();
                } else if (futurePosition.x == 100) {
                    this.game.score(GameSides.LEFT);
                    this.reset();
                } else if (futurePosition.y == 0 || futurePosition.y == 100) {
                    // TODO: For now, we'll simply reflect the ball whenever it
                    // reaches one of the vertical borders of the screen.
                    this.reflect(false, true);
                    this.predict();
                }
            }

            // We've processed this movement, discount it from the frame's
            // time.
            deltaTime -= movementTime;
        }

        // Move the ball towards its target.
        const progress = this.trajectory.elapsed / this.trajectory.duration;
        const distance = {
            x: (this.trajectory.destination.x - this.trajectory.origin.x),
            y: (this.trajectory.destination.y - this.trajectory.origin.y)
        };

        /* Linear movement. */
        this.position.x = this.trajectory.origin.x + distance.x * progress;
        this.position.y = this.trajectory.origin.y + distance.y * progress;
    }

    // Returns either `true` or `false`, depending if the given line `segment`
    // intersects with one of the `rectangle`'s sides.
    collidesWith(segment, rectangle) {
        // A little bit of sugar to shorten the following lines.
        const topLeft = { x: rectangle.left, y: rectangle.top };
        const topRight = { x: rectangle.right, y: rectangle.top };
        const bottomLeft = { x: rectangle.left, y: rectangle.bottom };
        const bottomRight = { x: rectangle.right, y: rectangle.bottom };

        // Define each side of the rectangle as a set of two points - i.e.
        // a line segment.
        const rectangleSegments = [
            { start: topLeft, end: bottomLeft },
            { start: topLeft, end: topRight },
            { start: topRight, end: bottomRight },
            { start: bottomLeft, end: bottomRight },
        ];

        for (const rectangleSegment of rectangleSegments) {
            if (Collision.lineToLine(segment.start, segment.end, rectangleSegment.start, rectangleSegment.end)) {
                return true;
            }
        }

        return false;
    }

    reset() {
        this.position = { x: 50, y: 50 };
        this.direction = Game.random(0, 2 * Math.PI);
        this.predict();
    }

    /* Changes the course of movement of the ball on the specified axes. */
    reflect(x, y) {
        if (x) {
            /* TODO: Limit this to `Math.PI * 2` (maximum). */
            this.direction += Math.PI;
        }

        if (y) {
            this.direction = (Math.PI * 2) - this.direction;
        }
    }

    /* Calculates the current trajectory of the ball until it reaches a border. */
    predict() {
        /* A little bit of sugar. */
        const velocity = this.getVelocity();

        /* List of time left to collide with each border. */
        const remainingTimes = [
            (0 - this.position.x) / velocity.x, /* Left wall. */
            (100 - this.position.x) / velocity.x, /* Right wall. */
            (0 - this.position.y) / velocity.y, /* Top wall. */
            (100 - this.position.y) / velocity.y, /* Bottom wall. */
        ];

        /*
            Negative times are discarded since they would mean going back
            (reversing the movement), while zero-time-left collisions are
            also discarded since it would mean colliding with the border
            we're on.
        */
        const positiveRemainingTimes = remainingTimes.filter(t => t > 0);
        const lowestRemainingTime = Math.min(...positiveRemainingTimes);

        this.trajectory.origin = {
            x: this.position.x, y: this.position.y
        };

        this.trajectory.destination = {
            x: Math.round(this.position.x + velocity.x * lowestRemainingTime),
            y: Math.round(this.position.y + velocity.y * lowestRemainingTime)
        };

        this.trajectory.elapsed = 0;

        /*
            Convert the duration to milliseconds so we don't need to convert
            `deltaTime` every time it is used.
        */
        this.trajectory.duration = lowestRemainingTime * 1000;
    }

    /* Returns this ball's position. */
    getPosition() {
        return {
            x: this.position.x,
            y: this.position.y,
        };
    }

    /* Returns this ball's velocity. */
    getVelocity() {
        return {
            x: this.speed * Math.cos(this.direction),
            // NOTE: Velocity on the Y axis is made its own opposite to match
            // the reference axis, where a larger Y value means that the
            // object is lower - instead of higher - on the screen.
            y: this.speed * Math.sin(this.direction) * -1,
        };
    }

    /* Returns this ball's trajectory. */
    getTrajectory() {
        return {
            origin: {
                x: this.trajectory.origin.x, y: this.trajectory.origin.y
            },

            destination: {
                x: this.trajectory.destination.x, y: this.trajectory.destination.y,
            },

            elapsed: this.trajectory.elapsed,
            duration: this.trajectory.duration,
        };
    }

    // Returns the position of the ball as if `time` milliseconds would have
    // passed since its last movement. The returned position might go beyond
    // the screen's borders.
    getFuturePosition(time) {
        const progress = (this.trajectory.elapsed + time) / this.trajectory.duration;
        const distance = {
            x: (this.trajectory.destination.x - this.trajectory.origin.x),
            y: (this.trajectory.destination.y - this.trajectory.origin.y)
        };
        
        return {
            x: this.trajectory.origin.x + distance.x * progress,
            y:this.trajectory.origin.y + distance.y * progress,
        };
    }
}
