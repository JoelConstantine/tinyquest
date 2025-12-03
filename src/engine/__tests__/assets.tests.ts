import { describe, it, expect, vi } from 'vitest'
import { AssetLoaderManager } from '../assets'

describe('AssetLoaderManager', () => {
    it('registers and retrieves a loader', async () => {
        const manager = new AssetLoaderManager()
        const mockLoader = {
            loadAsset: vi.fn().mockResolvedValue({ type: 'model', data: 'test' }),
        }

        manager.registerLoader('default', mockLoader)
        const asset = await manager.loadAsset('sphere.obj')

        expect(mockLoader.loadAsset).toHaveBeenCalledWith('sphere.obj')
        expect(asset.type).toBe('model')
    })

    it('overwriting a loader replaces the old one', async () => {
        const manager = new AssetLoaderManager()
        const oldLoader = { loadAsset: vi.fn().mockResolvedValue({ type: 'old' }) }
        const newLoader = { loadAsset: vi.fn().mockResolvedValue({ type: 'new' }) }

        manager.registerLoader('default', oldLoader)
        manager.registerLoader('default', newLoader)

        const asset = await manager.loadAsset('test.obj')
        expect(oldLoader.loadAsset).not.toHaveBeenCalled()
        expect(newLoader.loadAsset).toHaveBeenCalled()
        expect(asset.type).toBe('new')
    })
})
