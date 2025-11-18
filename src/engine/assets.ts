interface Asset {
  type: string;
  // Add other properties specific to each asset type here
}

interface AssetLoader {
  loadAsset(url: string): Promise<Asset>;
}

/**
 * Manager for asset loaders.
 *
 * Use `registerLoader` to register a loader for a particular asset type,
 * and `loadAsset(url)` to load an asset by URL. The manager will select the
 * appropriate loader based on the URL (or file extension) and delegate loading.
 */
export class AssetLoaderManager {
  private loaders: Map<string, AssetLoader>;

  constructor() {
    this.loaders = new Map();
  }

  registerLoader(type: string, loader: AssetLoader) {
    this.loaders.set(type, loader);
  }

  loadAsset(url: string): Promise<Asset> {
    const type = this.getTypeFromUrl(url);
    const loader = this.loaders.get(type);
    if (loader) {
      return loader.loadAsset(url);
    } else {
      throw new Error(`No loader registered for asset type ${type}`);
    }
  }

  private getTypeFromUrl(_url: string): string {
    // Implement logic to extract the asset type from the URL here
    // For example, if the URL is 'https://example.com/models/sphere.obj', 
    // you might return 'model'
    return 'default';
  }
}