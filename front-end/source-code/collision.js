export class Collision {
    // Returns `true` if two line segments intersect with each other, and
    // `false` if they don't intersect. Both line segments are defined
    // by two points. The first segment is defined by points A and B, while
    // the second is defined by points C and D.
    //
    // CREDITS: David Gouveia's answer at the `https://gamedev.stackexchange.com`
    // website.
    //
    // TODO: Find better names for the variables.
    static lineToLine(a, b, c, d) {
        const denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
        const numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
        const numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));

        // Detect coincident lines.
        //
        // TODO: The author says this method has a problem detecting
        // non-overlapping coincident lines. It might need a fix.
        if (denominator == 0) return (numerator1 == 0) && (numerator2 == 0);

        const r = numerator1 / denominator;
        const s = numerator2 / denominator;

        return (r >= 0 && r <= 1) && (s >= 0 && s <= 1);
    }
}
