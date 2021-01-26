import { AABB } from "./aabb.js";

const mainCanvas = document.getElementById("mainCanvas");

export class Paddle {
    #_x
    #_y
    #_aabb

    constructor() {
        this.#_x = 0;
        this.#_y = 0;
        this.#_aabb = new AABB(0, 0, 0, 0);

        /* Calculate the paddle's size for the first time. */
        this.#_adjustBoundingBox();
    }

    onResize() {
        this.#_adjustBoundingBox();
    }

    #_adjustBoundingBox() {
        /* Recalculate the size of the paddle. */
        const halfPaddleWidth = (mainCanvas.width * 0.005) * 0.5;
        const halfPaddleHeight = (mainCanvas.height * 0.1) * 0.5;

        /* Adjust the paddle's bounding-box. */
        this.#_aabb.left = this.x - halfPaddleWidth;
        this.#_aabb.right = this.x + halfPaddleWidth;
        this.#_aabb.top = this.y - halfPaddleHeight;
        this.#_aabb.bottom = this.y + halfPaddleHeight;
    }

    /* Returns the paddle's axis-aligned bounding-box, used for collisions. */
    get aabb() {
        return this.#_aabb;
    }

    set x(newX) {
        this.#_x = newX;
        this.#_adjustBoundingBox();
    }

    get x() {
        return this.#_x;
    }

    set y(newY) {
        this.#_y = newY;
        this.#_adjustBoundingBox();
    }

    get y() {
        return this.#_y;
    }
}
