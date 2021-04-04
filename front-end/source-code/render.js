// TODO: Remove?
import { themeButton } from "./dom.js";

// The render is an abstraction over the graphic backend used to display
// graphics to the screen. The interface provided is designed for
// immediate mode rendering, which would perform worse than a retained
// rendering approach, yet it is more than enough for our needs.
export class Render {
    // Paints a rectangle on the screen.
    rectangle(position, dimension, color) {

    }

    // Paints a circle on the screen.
    circle(position, radius, color) {

    }

    // Paints a image on the screen.
    image(data, position, dimensions) {

    }

    // Paints a line segment on the screen.
    segment(start, end, color, thickness) {
        
    }

    // Displays text on the screen.
    text(position, size, color, contents, font, alignment) {

    }
}

// Concrete HTML5 canvas backend.
export class CanvasRender {
    // TODO: Add documentation.
    // TODO: Add corresponding event handling.
    constructor(canvas, canvasContext) {
        this.canvas = canvas;
        this.canvasContext = canvasContext;

        window.addEventListener("resize", this.onResize.bind(this));

        this.theme = new RenderTheme();

        this.onResize();
    }

    // Called whenever the window changes its size, to keep the canvas' size
    // in synchronization with it.
    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Paints a rectangle in the screen.
    rectangle(position, dimensions, color) {
        // Transform percentages into pixels.
        const positionInPixels = {
            x: position.x * this.canvas.width / 100,
            y: position.y * this.canvas.height / 100
        };

        const dimensionsInPixels = {
            width: dimensions.width * this.canvas.width / 100,
            height: dimensions.height * this.canvas.height / 100
        };

        // Paint the rectangle.
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(
            positionInPixels.x, positionInPixels.y,
            dimensionsInPixels.width, dimensionsInPixels.height
        );
    }

    // Paints a circle on the screen.
    circle(position, radius, color) {
        // Transform percentages into pixels.
        const positionInPixels = {
            x: position.x * this.canvas.width / 100,
            y: position.y * this.canvas.height / 100
        };

        // Change color.
        this.canvasContext.fillStyle = color;

        // TODO: Why?
        this.canvasContext.beginPath();
        this.canvasContext.arc(
            positionInPixels.x, positionInPixels.y, radius, 0, Math.PI * 2
        );
        this.canvasContext.fill();
    }

    // Paints a image on the screen.
    image(data, position, dimensions) {
        // Transform percentages into pixels.
        const positionInPixels = {
            x: position.x * this.canvas.width / 100,
            y: position.y * this.canvas.height / 100
        };

        const dimensionsInPixels = {
            width: dimensions.width * this.canvas.width / 100,
            height: dimensions.height * this.canvas.height / 100
        };

        // Paint the image.
        this.canvasContext.drawImage(
            data,
            positionInPixels.x, positionInPixels.y,
            dimensionsInPixels.width, dimensionsInPixels.height
        );
    }

    // Paints a line segment on the screen.
    segment(start, end, color, thickness) {
        // Transform percentages into pixels.
        const startInPixels = {
            x: start.x * this.canvas.width / 100,
            y: start.y * this.canvas.height / 100
        };

        const endInPixels = {
            x: end.x * this.canvas.width / 100,
            y: end.y * this.canvas.height / 100
        };

        const thicknessInPixels = thickness * this.canvas.width / 100;

        // Create a new path so it doesn't start from the previous one.
        this.canvasContext.beginPath();

        // Create line segment.
        this.canvasContext.moveTo(startInPixels.x, startInPixels.y);
        this.canvasContext.lineTo(endInPixels.x, endInPixels.y);

        // Change color and thickness, and render segment.
        this.canvasContext.strokeStyle = color;
        this.canvasContext.lineWidth = thicknessInPixels;
        this.canvasContext.stroke();
    }

    // Displays text on the screen.
    text(position, size, color, contents, font, alignment) {
        // Transform percentages into pixels.
        const positionInPixels = {
            x: position.x * this.canvas.width / 100,
            y: position.y * this.canvas.height / 100
        };

        // Prepare the font.
        //
        // CREDITS: User "Grunt" from the "stackoverflow.com" website.
        this.canvasContext.font = size * window.innerWidth + "px " + font;

        // Change color and text alignment.
        this.canvasContext.fillStyle = color;
        this.canvasContext.textAlign = alignment;

        // Display.
        this.canvasContext.fillText(contents, positionInPixels.x, positionInPixels.y);
    }

    // Repaints every pixel on the screen with the specified `color`, to avoid
    // keeping pixels from the previous frame on screen.
    clear(color) {
        // Remove everything from the screen.
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Paint the background.
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// The theme class is linked to a DOM element which indicates the currently
// selected theme. Since the theme may change during the playthrough of the
// game, the class provides several methods to poll the correct color for
// a given game entity, such as the paddles or the ball.

// NOTE: This class operates as a Singleton - because the underlying DOM
// element is the same for all of the instances. We could reduce the class
// into static, exported functions that serve the same purpose. It has been
// kept as a class for the sake of neatness, since all other game elements
// are classes of their own.

// NOTE: This is kind of a gray object hidden behind a pile of better
// established objects. What I mean with this is that I'm not sure this
// class suffices the OOP concept appropiately, but whatever.
export class RenderTheme {
    // Returns the current color of the background.
    background() { return themeButton.colors.background; }

    // Returns the current color of the ball.
    ball() { return themeButton.colors.ball; }

    // Returns the current color of the paddle.
    paddle() { return themeButton.colors.paddle; }

    // Returns the current color of texts.
    texts() { return themeButton.colors.text; }
};
