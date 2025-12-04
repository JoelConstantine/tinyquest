import { SpriteSheet } from "../graphics/spritesheet"
import { Texture } from "../graphics/texture"

async function fetchJson<T>(resource: string): Promise<T> { 
    try {
        const result = await fetch(resource)
        if (!result.ok) throw new Error('Resource not found')
        const data = await result.json()
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export class AssetHandler {
  public baseUrl = './'
  constructor() {}
  
  async loadJson<T>(resource: string): Promise<T> {
      return await fetchJson<T>(resource)
  }

  loadTexture(resource: string): Texture {
    return Texture.from(this.baseUrl + resource)
  }
}

export class AssetManager {
  handler: AssetHandler
  constructor(handler: AssetHandler) {
      this.handler = handler
  }

  loadSpritesheet(resource: string) {
    const texture = this.handler.loadTexture(resource)
    const spritesheet = new SpriteSheet(texture);
    //spritesheets.set(resource, spritesheet)
    return spritesheet
  }
}