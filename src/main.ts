import './style.css'
import { CanvasViewport } from './engine/render/viewport'
import { Engine } from './engine/engine'
import { TinyQuest } from './game/app'


function main() {
  const viewport = CanvasViewport.new(800, 600)
  const elem = document.getElementById('tinyQuest')
  if (elem === null) return
  viewport.attachTo(elem)
  const engine = new Engine(viewport)

  const tinyQuest = new TinyQuest(engine)
  tinyQuest.start()
}

window.onload = () => {
  main()
}