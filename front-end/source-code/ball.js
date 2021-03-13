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
    constructor(position, speed, direction, render) {
        /* Information about movement. */
        this.position = position;
        this.speed = speed;
        this.direction = direction;

        /* Used to draw the ball on the screen. */
        this.render = render;

        /* Information about the ball's movement. */
        this.trajectory = {
            origin: { x: NaN, y: NaN },
            destination: { x: NaN, y: NaN },
            elapsed: NaN,
            duration: NaN,
        };

        /* Calculate the ball's trajectory for the first time. */
        this.predict();
    }

    /*
        Helper method to solve the circular reference between `Ball` objects
        and `Paddle` objects.

        NOTE: It doesn't solve it, it just ALLOWS the circular reference.
    */
    hackyPlugPaddles(paddles) {
        /* Paddles that this ball can collide with. */
        this.paddles = paddles;
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
        if (this.trajectory.elapsed + deltaTime > this.trajectory.duration) {
            /*
                If we calculate this movement, the ball would go off-screen
                without colliding with the paddles and/or being reflected.
                Thus, we split the movement into two parts: first, the
                ball is moved to its predicted destination, collisions are
                checked normally and the ball is reflected if needed. Then
                we proceed with the movement time that's left, as if it were
                a completely unrelated movement.
            */
            const remainingTime = this.trajectory.duration - this.trajectory.elapsed;

            this.updatePosition(remainingTime);
            this.updatePosition(deltaTime - remainingTime);
        }

        /* Update movement's elapsed time. */
        this.trajectory.elapsed += deltaTime;

        /*
            How much progress has been made (0 means no progress, 1 means the
            trajectory is complete).
        */
        const progress = (this.trajectory.elapsed / this.trajectory.duration);
        const distance = {
            x: (this.trajectory.destination.x - this.trajectory.origin.x),
            y: (this.trajectory.destination.y - this.trajectory.origin.y)
        };

        /* Linear movement. */
        this.position.x = this.trajectory.origin.x + distance.x * progress;
        this.position.y = this.trajectory.origin.y + distance.y * progress;

        /* Make sure the paddle doesn't go off-screen needlessly. */
        this.checkCollisions();
    }

    /*
        Checks if the paddle is on a border or colliding with a paddle,
        and reflects it appropiately.

        TODO: Check collisions with paddles.
    */
    checkCollisions() {
        if (this.position.x == 0 || this.position.x == 100) {
            /* We're on a horizontal border of the screen. */
            this.reflect(true, true);
            this.predict();
        } else if (this.position.y == 0 || this.position.y == 100) {
            /* We're on a vertical border of the screen. */
            this.reflect(false, true);
            this.predict();
        } else {
            /*
                TODO: Throw an exception or something to notify about
                the error.
            */
        }
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
            y: this.speed * Math.sin(this.direction),
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
}
