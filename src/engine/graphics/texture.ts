/**
 * @packageDocumentation
 * Image texture loading and management.
 */

/**
 * Represents a loaded image texture with lazy loading support.
 * Images are loaded asynchronously and accessed via the `image` getter.
 */
export class Texture {
  readonly url: string
  private _img!: HTMLImageElement
  private _loaded: boolean = false
  public baseUrl: string = '/'

  constructor(url: string) {
      this.url = url
  }

  get width() {
      return this._img.width
  }

  get height() {
      return this._img.height
  }

  get loaded() { return this._loaded }
  get image() { return this._img }
  
  load() {
    this._img = new Image()
    this._img.src = this.baseUrl + this.url
    this._img.onload = () => {
        this._loaded = true
    }
    return this
  }

  static from(src: string) {
    return new Texture(src).load()
  }
}