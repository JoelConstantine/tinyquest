import type { Surface } from "../render/surface";
import { Vector2D } from "../utils";

export class GraphicsObject {
  position: Vector2D
  constructor(x: number = 0 , y: number = 0) {
    this.position = new Vector2D(x, y)
  }
}

export class GraphicsContainer extends GraphicsObject {
  children: GraphicsObject[] = []

  addChild(child: GraphicsObject) {
    if(this.children.includes(child)) return
    this.children.push(child)
  }

  draw(surface: Surface) {
    for (const child of this.children) {
      // Placeholder for drawing logic
      // In a real implementation, we would call child's draw method
      // and pass the surface
    }
  }
}