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
    attachTo(element: HTMLElement) { 
        this.elem = element
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