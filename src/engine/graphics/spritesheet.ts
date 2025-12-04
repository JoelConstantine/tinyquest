import type { Dimensions } from "../utils"
import { Sprite } from "./sprite"
import { Texture } from "./texture"

export class SpriteSheet {
  sprites: Map<string | Dimensions, Sprite> = new Map()
  _texture: Texture

  constructor(texture: Texture) {
    this._texture = texture
  }

  insideTexture(x: number, y: number): boolean {
    return x >= 0 && x < this._texture.width && y >= 0 && y < this._texture.height
  }

  getSprite(key: Dimensions): Sprite | undefined {
    if (!this.insideTexture(key[0], key[1])) return

    if (this.sprites.has(key)) {
      return this.sprites.get(key)!
    }
    
    const sprite = Sprite.new(this._texture, key)
    this.sprites.set(key, sprite)
    return sprite
  }
}