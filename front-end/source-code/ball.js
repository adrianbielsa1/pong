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

        /*
            Bounce the ball if it crashes with a paddle and make sure it
            doesn't go off-screen.
        */
        this.checkForCollisions();
        this.checkForBorders();
    }

    checkForCollisions() {
        for (const paddle of this.paddles) {
            if (this.collidesWith(paddle)) {
                this.reflect(true, true);
                this.predict();

                return;
            }
        }
    }

    reset() {
        this.position = { x: 50, y: 50 };
        this.direction = 1.3;
        this.predict();
    }

    checkForBorders() {
        if (this.position.x == 0 || this.position.x == 100) {
            /* We're on one of the horizontal borders of the screen. */
            this.reflect(true, true);
            this.predict();
        } else if (this.position.y == 0 || this.position.y == 100) {
            /* We're on one of the vertical borders of the screen. */
            this.reflect(false, true);
            this.predict();
        }
    }

    /*
        Returns `true` or `false` depending on whether the ball is
        colliding with a paddle, or not.

        CREDITS: Matt Worden.
    */
    collidesWith(paddle) {
        /* TODO: Remove or simplify. */
        const circle = {
            x: this.position.x,
            y: this.position.y,
        };

        const aabb = {
            left: paddle.position.x,
            right: paddle.position.x + paddle.dimensions.width,
            top: paddle.position.y,
            bottom: paddle.position.y + paddle.dimensions.height,
        };

        /* TODO: Hardcoded ball's radius. */
        const radius = 1;

        /* Will be used for testing against the edges. */
        let testX = circle.x;
        let testY = circle.y;

        /* Obtain the closest horizontal edge. */
        if (circle.x < aabb.left) { testX = aabb.left; }
        else if (circle.x > aabb.right) { testX = aabb.right; }

        /* Obtain the closest vertical edge. */
        if (circle.y < aabb.top) { testY = aabb.top; }
        else if (circle.y > aabb.bottom) { testY = aabb.bottom; }

        /* Get the distance from the closest edge. */
        const distanceX = circle.x - testX;
        const distanceY = circle.y - testY;
        const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        /* If the distance is less than the radius, then they're colliding. */
        return distance <= radius;
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
