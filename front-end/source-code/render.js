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
    // TODO: Add documentation.
    constructor() {
        this.image = document.getElementById("themeImage");
        this.image.addEventListener("click", this.onClick.bind(this));
    }

    // Called whenever the theme changer DOM object is clicked.
    onClick(eventInformation) {
        switch (this.current()) {
            case "dark":
                // Change image to dark mode. The theme is now light.
                this.image.title = "Dark mode";
                this.image.alt = "Dark mode";
                this.image.src = "media/dark-mode.svg";
                break;

            case "light":
                // Change image to light mode. The theme is now dark.
                this.image.title = "Light mode";
                this.image.alt = "Light mode";
                this.image.src = "media/light-mode.svg";
                break;
        }
    }

    // Returns the current theme.
    current() {
        switch (this.image.title) {
            case "Light mode":
                return "dark";
            case "Dark mode":
                return "light";
        }
    }

    // Returns the current color of the background.
    background() {
        switch (this.current()) {
            case "light":
                return "white";
            case "dark":
                return "black";
        }
    }

    // Returns the current color of the ball.
    ball() {
        switch (this.current()) {
            case "light":
                return "blue";
            case "dark":
                return "aquamarine"; // "lightGrey";
        }
    }

    // Returns the current color of the paddle.
    paddle() {
        switch (this.current()) {
            case "light":
                return "black";
            case "dark":
                return "white";
        }
    }
}
