import './style.css'
import { CanvasViewport } from './engine/render/viewport'
import { Engine } from './engine/engine'
import { TinyQuest } from './game/app'
import { CanvasSurface } from './engine/render/surface'

function main() {
  const surface = CanvasSurface.from('tinyQuest')
  const viewport = CanvasViewport.from(surface, 800, 600)
  const engine = new Engine(viewport)

  const tinyQuest = new TinyQuest(engine)
  tinyQuest.start()
}

window.onload = () => {
  main()
}