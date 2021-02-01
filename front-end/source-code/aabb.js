/* A mutable alternative to DOMRect. */
export class AABB {
    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    get width() {
        return Math.abs(this.left - this.right);
    }

    get height() {
        return Math.abs(this.top - this.bottom);
    }
}
