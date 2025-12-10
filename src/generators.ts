import { CanvasSurface, Surface } from "./engine/render/surface"
import { Toolbar } from "./modules/components"
import { useRoomsAndMazes } from "./modules/generators/grid/roomsAndMazes"
import type { Grid } from "./modules/generators/grid/grid"
import { useForestGenerator } from "./modules/generators/forestGenerator"
import type { Room } from "./modules/generators/grid/roomBuilder"

class DisplayMaze {
    surface: CanvasSurface
    constructor(surface: CanvasSurface) {
        this.surface = surface
    }

    initialize(grid: Grid) {
        this.surface.adjustResolution(grid.width * 14, grid.height * 14)
        this.surface.drawRect(0, 0, this.surface.resolution.x, this.surface.resolution.y, '#000000')
    }

    draw(grid: Grid) {
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

    drawRooms(rooms: Room[]) {
        for(const room of rooms) {
            for (const cell of room.cells) {
                const px = cell.x * 14
                const py = cell.y * 14

                this.surface.drawRect(px, py, 14, 14, '#60a267ff')

                if (cell.walls.top) {
                    this.surface.drawRect(px, py, 14, 1, 'rgba(29, 46, 37, 1)')
                }
                if (cell.walls.right) {
                    this.surface.drawRect(px + 13, py, 1, 14, 'rgba(29, 46, 37, 1)')
                }
                if (cell.walls.bottom) {
                    this.surface.drawRect(px, py + 13, 14, 1, 'rgba(29, 46, 37, 1)')
                }
                if (cell.walls.left) {
                    this.surface.drawRect(px, py, 1, 14, 'rgba(29, 46, 37, 1)')
                }
            }
        }
    }
}

async function main() {
    //const tilesetData = await Resources.loadJson<TilesetData>('/data/tilesets/forest-module.json')
    //createAppearances(tilesetData.appearances)
    
    const surface = CanvasSurface.from('rooms-and-mazes')
    const generator = useRoomsAndMazes(40, 40, {
        minRoomWidth: 1,
        minRoomHeight: 1,
        maxRoomWidth: 5,
        maxRoomHeight: 5,
        maxAttempts: 60,
    })

    const forestGenerator = useForestGenerator(80, 80, {
        rooms: {
            minRoomWidth: 2,
            minRoomHeight: 2,
            maxRoomWidth: 8,
            maxRoomHeight: 8,
            maxAttempts: 60,
        }
    }) 

    const displayMaze = new DisplayMaze(surface)
    displayMaze.initialize(generator.grid)

    const toolbar = new Toolbar(document.body)

    function tick() {
        const working = generator.step()
        displayMaze.draw(generator.grid)

        if (working) window.requestAnimationFrame(tick)
    }

    toolbar
        .addAction("Generate", () => {
            const forest = forestGenerator.build()
            displayMaze.draw(forest.grid)
            //displayMaze.drawRooms(forest.rooms)
        })
        .addAction("Step", () => {
            generator.step()
            displayMaze.draw(generator.grid)
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