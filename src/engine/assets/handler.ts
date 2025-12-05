/**
 * @packageDocumentation
 * Asset loading system for textures, JSON data, and spritesheets.
 */

import { SpriteSheet } from "../graphics/spritesheet"
import { Texture } from "../graphics/texture"

/**
 * Helper function to fetch and parse JSON resources.
 * @param resource - URL of the JSON resource.
 * @returns Parsed JSON data.
 * @throws Error if fetch fails or response is not ok.
 */
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

/**
 * Handles loading of assets such as textures and JSON data.
 * Provides base URL management for relative asset paths.
 */
export class AssetHandler {
  public baseUrl = './'
/**
 * Creates an asset handler with default baseUrl './'.
 */
  constructor() {}
  
  /**
   * Asynchronously loads and parses JSON from a resource URL.
   * @param resource - Path to the JSON file.
   * @returns Parsed JSON data.
   */
  async loadJson<T>(resource: string): Promise<T> {
      return await fetchJson<T>(resource)
  }

  /**
   * Loads a texture from a resource URL.
   * @param resource - Path to the image file.
   * @returns A texture that will load asynchronously.
   */
  loadTexture(resource: string): Texture {
    return Texture.from(this.baseUrl + resource)
  }
}

/**
 * Manages asset loading and caching.
 * Provides high-level methods for loading spritesheets and other assets.
 */
export class AssetManager {
  handler: AssetHandler
  /**
   * Creates an asset manager.
   * @param handler - The underlying asset handler to use.
   */
  constructor(handler: AssetHandler) {
      this.handler = handler
  }

  /**
   * Loads a spritesheet from a texture resource.
   * @param resource - Path to the spritesheet texture.
   * @returns A loaded spritesheet.
   */
  loadSpritesheet(resource: string) {
    const texture = this.handler.loadTexture(resource)
    const spritesheet = new SpriteSheet(texture);
    //spritesheets.set(resource, spritesheet)
    return spritesheet
  }
}