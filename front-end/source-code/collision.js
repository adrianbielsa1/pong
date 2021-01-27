/* AUTHOR: Matt Worden. */
export function circleAndAABB(circle, aabb) {
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
    return distance <= circle.radius;
}
