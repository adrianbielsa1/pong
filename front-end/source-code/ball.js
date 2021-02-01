import { Circle } from "./circle.js";

export class Ball {
    #_x
    #_y
    #_angle

    constructor(x, y, radius) {
        this.#_x = x;
        this.#_y = y;
        this.radius = radius;

        this.circle = new Circle(x, y, 1);
        this.speed = 4;

        /* Starting angle. */
        this.angle = Math.random() * 91 - 45;

        /* 50% chance of swapping the starting direction. */
        if (Math.random() < 0.5) { this.angle += 180; }
    }

    set x(newX) {
        this.#_x = newX;
        this.circle.x = newX;
    }

    get x() {
        return this.#_x;
    }

    set y(newY) {
        this.#_y = newY;
        this.circle.y = newY;
    }

    get y() {
        return this.#_y;
    }

    set angle(newAngle) {
        while (newAngle > 360) {
            newAngle -= 360;
        }

        while (newAngle < 0) {
            newAngle += 360;
        }

        this.#_angle = newAngle;
    }

    get angle() {
        return this.#_angle;
    }

    reflectHorizontally() {
        this.angle += 180;
    }

    reflectVertically() {
        this.angle = (360 - this.angle);
    }
}
