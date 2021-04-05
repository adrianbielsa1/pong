import { Ball } from "./ball.js";
import { Game, GameSides } from "./game.js";
import { Render } from "./render.js";
import { BotPaddle, PlayerPaddle } from "./paddle.js";

// Base class used to build concrete screens.
export class Screen {
    constructor() {

    }

    draw() {

    }

    update() {

    }

    // Called whenever the site's visibility is changed.
    handleSiteVisibilityChange() {}

    // Called whenever the game's difficulty is changed.
    handleGameDifficultyChange() {}

    // Called whenever the game's screen is changed.
    handleGameScreenChange(newScreen) {}
};

// A screen where the player can change the game's difficulty, the side
// they play, etc.
export class MenuScreen extends Screen {
    constructor(game) {
        // Invoke our parent's constructor.
        super();

        // Store objects so we can use them later.
        this.game = game;
        this.images = new MenuScreenImages(game);

        this.elements = [
            { image: "left-arrow.png", position: { x: 38, y: 70 }, dimensions: { width: 2, height: 5 } },
            { image: "right-arrow.png", position: { x: 60, y: 70 }, dimensions: { width: 2, height: 5 } },
        ];
    }

    draw() {
        const render = this.game.getRender();

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        for (const element of this.elements) {
            const elementData = this.images.get(element.image);

            // Ensure the image is loaded.
            if (!(elementData === null)) {
                render.image(elementData, element.position, element.dimensions);
            }
        }

        this.drawDifficultySelector();
    }

    // TODO: This function is very hardcoded.
    drawDifficultySelector() {
        // A little bit of sugar to make the following lines shorter.
        const render = this.game.getRender();
        const leftArrow = this.elements[0];
        const rightArrow = this.elements[1];

        const distanceBetweenArrows = {
            x: Math.abs((leftArrow.position.x + leftArrow.dimensions.width) - rightArrow.position.x),
            y: Math.abs(leftArrow.position.y - rightArrow.position.y),
        };

        const difficultyLevels = 5;

        const rectangleDimensions = {
            width: distanceBetweenArrows.x / (difficultyLevels * 2),
            height: leftArrow.dimensions.height,
        };

        const currentPosition = {
            x: leftArrow.position.x + leftArrow.dimensions.width + rectangleDimensions.width / 2,
            y: leftArrow.position.y,
        };

        for (let index = 0; index < difficultyLevels; index += 1) {
            render.rectangle(currentPosition, rectangleDimensions, "gray");

            currentPosition.x += rectangleDimensions.width * 2;
        }
    }
};

class MenuScreenImages {
    constructor(game) {
        // Store objects so we can use them later.
        this.game = game;

        // Load all images for the first time.
        this.reload();
    }

    // Reloads several images that will be used to render different
    // elements on the screen.
    reload() {
        // Sugar so we can call them when using the `map`/`forEach` functions.
        const load = this.load.bind(this);
        const store = this.store.bind(this);

        const themePath = this.game.getRender().theme.getPath();

        const imageNames = ["left-arrow.png", "right-arrow.png"];
        const imagePaths = imageNames.map((name) => { return themePath + name; });

        const imagePromises = imagePaths.map((path) => { return load(path); });

        // Clear the map of images.
        this.images = {};

        // Store all images once they're loaded.
        //
        // NOTE: This does NOT wait until the images are loaded; they're loaded
        // asynchronously.
        Promise.all(imagePromises).then((images) => { images.forEach(store); });
    }

    // Begins the loading process of an image, returning a `Promise` object
    // to track its state.
    //
    // CREDITS: User "ggorlen" from the "stackoverflow.com" website.
    load(imageSource) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            // Prepare callbacks before loading the image.
            image.onload = () => { return resolve(image); };
            image.onerror = reject;

            // Begin loading the image.
            image.src = imageSource;
        });
    }

    store(image) {
        // We do this because accessing the `src` property directly returns
        // the absolute URL, including protocol (HTTP/HTTPS), website, and
        // other characters we do not care about. This way, we only get the
        // relative path.
        const relativeImagePath = image.getAttribute("src");

        this.images[relativeImagePath] = image;
    }

    get(imageName) {
        const imagePath = this.game.getRender().theme.getPath() + imageName;

        if (imagePath in this.images) {
            return this.images[imagePath];
        } else {
            // Being here means that - probably - the theme has changed
            // and we don't have the images for said theme loaded yet,
            // so we load them :)
            this.reload();
            return null;
        }
    }
}

// The screen where the player and the AI play against each other.
export class IngameScreen extends Screen {
    constructor(game) {
        // Invoke our parent's constructor.
        super();

        // Store objects so we can use them later.
        this.game = game;

        // Generate initial values for the ball.
        //
        // NOTE: This is just a commodity so I can remember better
        // what is the meaning of each value, since Javascript doesn't
        // support named parameters (as of the time of writing).
        const ballPosition = { x: 50, y: 50 };
        const ballSpeed = 25;
        const ballDirection = Game.random(0, 2 * Math.PI);

        // Generate initial values for the paddles.
        //
        // TODO: Isn't kind of bad sharing the same dimensions for every
        // paddle? They should copy the object internally.
        const paddleDimension = { width: 0.5, height: 10 };

        // Create paddles.
        this.paddles = [
            new PlayerPaddle({ x: 0, y: 45 }, paddleDimension, this.game),

            // TODO: "7" is just a placeholder number.
            new BotPaddle({ x: 99.75, y: 45 }, paddleDimension, this.game, 7),
        ];

        // Create ball.
        this.ball = new Ball(
            ballPosition, ballSpeed, ballDirection,
            this.game, this.paddles
        );
    }

    draw() {
        const render = this.game.getRender();
        const difficulty = this.game.getDifficulty().getCurrent().description;

        // Remove the previous frame from the screen.
        render.clear(render.theme.background());

        // Draw scores.
        render.text(
            { x: 40, y: 52.5 }, 0.05, render.theme.texts(), this.game.scores[GameSides.LEFT], "Arial", "center"
        );

        render.text(
            { x: 60, y: 52.5 }, 0.05, render.theme.texts(), this.game.scores[GameSides.RIGHT], "Arial", "center"
        );

        // Draw difficulty.
        render.text(
            { x: 50, y: 5 }, 0.02, render.theme.texts(), "Difficulty: " + difficulty, "Arial", "center"
        );

        // Draw all objects.
        this.ball.draw();
        this.paddles.forEach(paddle => paddle.draw());
    }

    update(deltaTime) {
        // NOTE: The `Ball` object updates the paddles internally.
        this.ball.update(deltaTime);
    }

    handleGameDifficultyChange() {
        this.paddles.forEach(p => { p.handleGameDifficultyChange(); });
    }
};
