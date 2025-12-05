/**
 * @packageDocumentation
 * UI components for interactive controls and toolbars.
 */

/**
 * Simple toolbar UI component that displays buttons for actions.
 * Handles creation and management of action buttons.
 */
export class Toolbar {
    toolbar: HTMLElement
    /**
     * Creates a toolbar and attaches it to the target element.
     * @param target - The HTML element to contain the toolbar.
     */
    constructor(target: HTMLElement) {
        const toolbar = document.createElement('div')
        toolbar.classList.add('toolbar')

        target.prepend(toolbar);

        this.toolbar = toolbar
    }

    /**
     * Adds an action button to the toolbar.
     * @param name - Label text for the button.
     * @param action - Callback function to execute when button is clicked.
     * @returns This toolbar for chaining.
     */
    public addAction(name: string, action: () => void) {
        const button = document.createElement('button')
        button.innerText = name
        button.addEventListener('click', action)
        this.toolbar.appendChild(button)
        return this
    }
}