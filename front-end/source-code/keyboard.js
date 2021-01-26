export const KeyboardKeys = {
    Up: 38,
    Down: 40
}

export class Keyboard {
    constructor() {
        this.keysStates = {};
    }

    onKeyDown(event) {
        this.keysStates[event.keyCode] = true;
    }

    onKeyUp(event) {
        this.keysStates[event.keyCode] = false;
    }

    isPressed(key) {
        return this.keysStates[key];
    }
}
