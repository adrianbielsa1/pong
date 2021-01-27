import { Circle } from "./circle.js";

export class Ball {
    #_x
    #_y

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
}
