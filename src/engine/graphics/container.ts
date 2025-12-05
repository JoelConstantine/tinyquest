/**
 * @packageDocumentation
 * Graphics object hierarchy for managing drawable elements.
 */

import type { Surface } from "../render/surface";
import { Vector2D } from "../utils";

/**
 * Base class for all drawable graphics objects.
 * Provides position management and a draw interface.
 */
export class GraphicsObject {
  position: Vector2D
  constructor(x: number = 0 , y: number = 0) {
    this.position = new Vector2D(x, y)
  }

  draw(_surface: Surface) { }
}

/**
 * A graphics object that can contain child graphics objects.
 * Manages a hierarchy of drawable objects.
 */
export class GraphicsContainer extends GraphicsObject {
  children: GraphicsObject[] = []

  /**
   * Adds a child graphics object to this container.
   * @param child - The child object to add.
   */
  addChild(child: GraphicsObject) {
    if(this.children.includes(child)) return
    this.children.push(child)
  }

  draw(_surface: Surface) {
    for (const child of this.children) {
      child.draw(_surface)
      // Placeholder for drawing logic
      // In a real implementation, we would call child's draw method
      // and pass the surface
    }
  }
}