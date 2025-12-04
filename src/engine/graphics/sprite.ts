import type { Surface } from "../render/surface";
import { Vector2D, type Dimensions } from "../utils";
import { GraphicsObject } from "./container";
import type { Texture } from "./texture";


class RectGraphics extends GraphicsObject {
  dimensions: Vector2D
  centered: boolean = true

  get width(): number { return this.dimensions.x }
  get height(): number { return this.dimensions.y }
  constructor(width: number, height: number) {
    super(0, 0) 
    this.dimensions = new Vector2D(width, height)
  }
}

export class Sprite extends RectGraphics {
  _textureLocation: Dimensions
  _texture: Texture
  constructor(texture: Texture, dimensions: Dimensions = [0, 0, 16, 16]) {
    super(dimensions[2], dimensions[3])
    this._texture = texture
    this._textureLocation = dimensions
  }

  draw(surface: Surface) { 
    surface.ctx.translate(this.position.x, this.position.y)
    const x = this.centered ? this.width / 2 : 0
    const y = this.centered ? this.height / 2 : 0
    surface.ctx.drawImage(
      this._texture.image,
      this._textureLocation[0],
      this._textureLocation[1],
      this.dimensions.x,
        this.dimensions.y,
        x,
        y,
        this.dimensions.x,
        this.dimensions.y
    )
  }

  static new(texture: Texture, dimensions: Dimensions): Sprite {
    return new Sprite(texture)
  }

}