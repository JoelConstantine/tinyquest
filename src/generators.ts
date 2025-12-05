import { CanvasSurface, Surface } from "./engine/render/surface"
import { Toolbar } from "./modules/components"
import { useRoomsAndMazes } from "./modules/generators/roomsAndMazes"
import { type IBuilder } from "./modules/generators/roomBuilder"

class DisplayMaze {
    surface: Surface
    builder: IBuilder
    constructor(surface: Surface, builder: IBuilder) {
        this.surface = surface
        this.builder = builder
    }

    initialize() {
       const grid = this.builder.grid
        this.surface.adjustResolution(grid.width * 14, grid.height * 14)
        this.surface.drawRect(0, 0, this.surface.resolution.x, this.surface.resolution.y, '#000000')
    }

    draw() {
        const grid = this.builder.grid
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.getCell(x, y)
                if (!cell || !cell.visited) continue
                const px = x * 14
                const py = y * 14

                this.surface.drawRect(px, py, 14, 14, '#ff0000')
                if (cell.walls.top) {
                    this.surface.drawRect(px, py, 14, 1, '#000000')
                }
                if (cell.walls.right) {
                    this.surface.drawRect(px + 13, py, 1, 14, '#000000')
                }
                if (cell.walls.bottom) {
                    this.surface.drawRect(px, py + 13, 14, 1, '#000000')
                }
                if (cell.walls.left) {
                    this.surface.drawRect(px, py, 1, 14, '#000000')
                }
            }
        }
    }
}

async function main() {
    //const tilesetData = await Resources.loadJson<TilesetData>('/data/tilesets/forest-module.json')
    //createAppearances(tilesetData.appearances)
    
  const surface = CanvasSurface.from('rooms-and-mazes')
  const generator = useRoomsAndMazes(50, 50, {
    minRoomWidth: 1,
    minRoomHeight: 1,
    maxRoomWidth: 5,
    maxRoomHeight: 5,
    maxAttempts: 60,
  })

  const displayMaze = new DisplayMaze(surface, generator)
  displayMaze.initialize()

    const toolbar = new Toolbar(document.body)

    function tick() {
        const working = generator.step()
        displayMaze.draw()

        if (working) window.requestAnimationFrame(tick)
    }

    toolbar
        .addAction("Generate", () => {
            generator.build()
            displayMaze.draw()
        })
        .addAction("Step", () => {
            generator.step()
            displayMaze.draw()
        })
        .addAction('Watch Generation', () => {
            // generator.start()
            window.requestAnimationFrame(tick)
        })
        // .addAction('Prune Dead Ends', () => {
        //     generator.pruneAll(5)
        //     generator.draw()
        // })
         
    //generator.draw()
}

window.onload = () => { main() }