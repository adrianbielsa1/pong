const themeImage = document.getElementById("themeImage");

/* Returns the current theme. */
function getCurrentTheme() {
    switch (themeImage.title) {
        case "Light mode":
            return "dark";
        case "Dark mode":
            return "light";
    }
}

/* TODO: Handle invalid `themeImage.title` values? */
/* Changes the current theme. */
function onClick() {
    switch (getCurrentTheme()) {
        case "dark":
            /* Change image to dark mode. The theme is now light. */
            themeImage.title = "Dark mode";
            themeImage.alt = "Dark mode";
            themeImage.src = "media/dark-mode.svg";
            break;

        case "light":
            /* Change image to light mode. The theme is now dark. */
            themeImage.title = "Light mode";
            themeImage.alt = "Light mode";
            themeImage.src = "media/light-mode.svg";
            break;
    }
}

/* Prepares keyboard/mouse callbacks, among other things. */
function prepare() {
    themeImage.addEventListener("click", onClick);
}

/* Returns the current color for the background. */
export function background() {
    switch (getCurrentTheme()) {
        case "light":
            return "white";
        case "dark":
            return "black";
    }
}

/* Returns the current color for the paddles. */
export function paddle() {
    switch (getCurrentTheme()) {
        case "light":
            return "black";
        case "dark":
            return "white";
    }
}

/* Returns the current color for the ball. */
export function ball() {
    switch (getCurrentTheme()) {
        case "light":
            return "blue";
        case "dark":
            return "aquamarine"; //"lightGrey";
    }
}

/* Set up everything. */
prepare();
