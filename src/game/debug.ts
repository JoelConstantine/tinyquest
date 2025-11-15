// class BlankScreen implements BaseScreen {
//     init(_engine: Engine) { return this }
//     pause() { return this }
//     resume() { return this }
//     render(engine: Engine) {
//         engine.render.blank()
//         return this
//     }
//     update(_engine: Engine, _delta: number) { return this }
// }

export class DebugPanel {
    elem!: HTMLElement
    init() {
        const panel = document.createElement('section')
        this.elem = panel
        panel.classList.add('debug-panel')
        panel.innerText = 'Debug Panel Active'
        return this
    }
    attachTo(element: HTMLElement) { 
        if (!this.elem) this.init()
        element.appendChild(this.elem)
    }
}

export const useDebugPanel = (elem: HTMLElement | string) => {
    if (typeof elem === 'string') {
        const target = document.getElementById(elem)
        if (!target) throw new Error(`Element with id ${elem} not found`)
        elem = target
    }
    const debugPanel = new DebugPanel()
    debugPanel.attachTo(elem)
    return debugPanel
}