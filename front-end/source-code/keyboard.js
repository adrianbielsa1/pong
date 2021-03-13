/* The keyboard is a small layer to the physical keyboard. */
export class Keyboard {
    /*
        Returns either `true` or `false`, depending on whether the specified
        key is pressed or not.
    */
    isPressed(key) {

    }
}

/*
    Concrete implementation that makes use of the window's keyboard
    interface.
*/
export class WindowKeyboard {
    /* Links this instance with the required objects. */
    constructor() {
        /*
            NOTE: A call to `bind` is required because, otherwise, when using
            `this` inside this class' methods, it would refer to the event
            itself, instead of the current instance.
        */
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        /* Maps a key with its current pressed state. */
        this.states = {};
    }

    /* Automatically called whenever a key is pushed down. */
    onKeyDown(eventInformation) {
        this.states[eventInformation.keyCode] = true;
    }

    /* Automatically called whenever a key is released. */
    onKeyUp(eventInformation) {
        this.states[eventInformation.keyCode] = false;
    }

    /*
        Returns either `true` or `false`, depending on whether the specified
        key is pressed or not.
    */
    isPressed(keyCode) {
        return this.states[keyCode];
    }
}

/*
    List of all possible keys that can be tracked by the keyboard. Since
    there are no native enumerations in Javascript, we create a constant
    object and freeze all of its properties so it cannot be modified.
*/
export const KeyboardKeys = {
    /* Arrow keys. */
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

/* TODO: Can't this be just `KeyboardKeys.freeze()`? */
Object.freeze(KeyboardKeys);
