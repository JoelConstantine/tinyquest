import { CanvasSurface } from "./engine/render/surface"
import { Toolbar } from "./modules/components"
import { useRoomsAndMazes } from "./modules/generators/grid/roomsAndMazes"
import type { Grid } from "./modules/generators/grid/grid"
import { useForestGenerator } from "./modules/generators/forestGenerator"
import type { Room } from "./modules/generators/grid/roomBuilder"
import type { Terrain } from "./modules/map"

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
        this.initialize(grid)
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.getCell(x, y)
                if (!cell) continue
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

    drawTerrain(terrain: Terrain) {
        this.surface.adjustResolution(terrain.dimensions.x * 14, terrain.dimensions.y * 14)
        this.surface.drawRect(0, 0, this.surface.resolution.x, this.surface.resolution.y, '#000000')
        for(const tile of terrain.tiles) {
            if (!tile) continue
            const px = tile.position.x * 14
            const py = tile.position.y * 14

            const color = tile.passable ? '#639c69ff' : '#5f4627ff'

            this.surface.drawRect(px, py, 14, 14, color)
        }
    }
}

async function main() {
    //const tilesetData = await Resources.loadJson<TilesetData>('/data/tilesets/forest-module.json')
    //createAppearances(tilesetData.appearances)
    
    const surface = CanvasSurface.from('rooms-and-mazes')

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

    const toolbar = new Toolbar(document.body)

    function tick() {
        const working = forestGenerator.step()
        displayMaze.draw(forestGenerator.roomsAndMazes.grid)

        if (working) window.requestAnimationFrame(tick)
    }

    toolbar
        .addAction("Generate", () => {
            const forest = forestGenerator.build()
            //displayMaze.draw(forest.grid)
            displayMaze.drawTerrain(forest.map.terrain)
        })
        .addAction("Step", () => {
            forestGenerator.step()
            displayMaze.draw(forestGenerator.roomsAndMazes.grid)
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