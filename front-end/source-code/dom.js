// The "DOM" module is meant to ease interaction with DOM elements.

const notifyThemeChange = new Event("notifyThemeChange");
const queryHelpScreenShow = new Event("queryHelpScreenShow");
const queryIngameScreenShow = new Event("queryIngameScreenShow");

export const themeButton = {
    element: document.getElementById("themeButton"),
    current: "dark",

    // Dictionary that maps a element of the game to its current color.
    //
    // NOTE: These are just the initial theme's colors, and they should match
    // the ones set by the `onThemeChange` function.
    colors: { background: "black", ball: "white", paddle: "white", text: "green" },

    // Changes the current theme.
    swap: function(newTheme) {
        themeButton.current = newTheme;
    },

    // Returns a path to where the current theme's images should be
    // stored.
    path: function() {
        return "media/" + themeButton.current + "/";
    },

    // Called whenever the theme button is clicked.
    onClick: function() {
        themeButton.element.src = themeButton.path() + "selector.svg";

        switch (themeButton.current) {
            case "dark":
                themeButton.element.title = "Light theme";
                themeButton.element.alt = "Light theme";

                themeButton.current = "light";
                break;
            case "light":
                themeButton.element.title = "Dark theme";
                themeButton.element.alt = "Dark theme";

                themeButton.current = "dark";
                break;
        };

        document.dispatchEvent(notifyThemeChange);
    },

    // Called whenever the site's theme changes.
    onThemeChange: function() {
        switch (themeButton.current) {
            case "dark":
                themeButton.colors = {
                    background: "black", ball: "white",
                    paddle: "white", text: "green"
                };
                break;
            case "light":
                themeButton.colors = {
                    background: "white", ball: "black",
                    paddle: "black", text: "blue"
                };
                break;
        };
    },
};

export const helpButton = {
    element: document.getElementById("helpButton"),

    // Changes the button's title & image to match its current job.
    swap: function(newAction) {
        const currentPath = themeButton.path();

        helpButton.element.title = newAction;
        helpButton.element.alt = newAction;

        switch (newAction) {
            case "Help":
                helpButton.element.src = currentPath + "help.svg";
                break;
            case "Go back":
                helpButton.element.src = currentPath + "go-back.svg";
                break;
        };
    },

    // Called whenever the help button is clicked.
    onClick: function() {
        switch (helpButton.element.title) {
            case "Help":
                helpButton.swap("Go back");
                document.dispatchEvent(queryHelpScreenShow);
                break;
            case "Go back":
                helpButton.swap("Help");
                document.dispatchEvent(queryIngameScreenShow);
                break;
        };
    },

    // Called whenever the site's theme changes.
    onThemeChange: function() {
        // NOTE: We're not swapping the action, just querying a refresh of the
        // button's image so it matches the current theme.
        helpButton.swap(helpButton.element.title);
    },
};

export const mainCanvas = {
    element: document.getElementById("mainCanvas"),
    context: document.getElementById("mainCanvas").getContext("2d"),

    // Caled whenever the site's area of display changes.
    onSiteResize: function() {
        mainCanvas.element.width = window.innerWidth;
        mainCanvas.element.height = window.innerHeight;
    },
};

// Hook events so the elements know when they're clicked (or some other
// action is performed on them).
themeButton.element.addEventListener("click", themeButton.onClick);
helpButton.element.addEventListener("click", helpButton.onClick);

// Let the button know when the theme changes so they can refresh properly.
document.addEventListener("notifyThemeChange", themeButton.onThemeChange);
document.addEventListener("notifyThemeChange", helpButton.onThemeChange);

// Let the canvas know when the site changes.
window.addEventListener("resize", mainCanvas.onSiteResize);

// NOTE: We do not freeze the `themeButton` object because we need to keep
// track of the current theme which means mutating the button's internal
// state.
Object.freeze(helpButton);
Object.freeze(mainCanvas);
