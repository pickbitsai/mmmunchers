// Asset loader with lazy loading and memory management for 3D assets
import { useLoader } from '@react-three/fiber';
import { GLTFLoader, GLTF } from 'three-stdlib';
import { Object3D, Material, Texture, Mesh } from 'three';

// Asset cache to prevent reloading
const assetCache = new Map<string, Promise<GLTF>>();
const loadedAssets = new Set<string>();

// Preload critical assets
const CRITICAL_ASSETS = [
  '/geometries/heart.gltf'
];

// Asset loading utilities
export class AssetLoader {
  private static instance: AssetLoader;
  private loader = new GLTFLoader();
  private loadingPromises = new Map<string, Promise<GLTF>>();

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  // Lazy load asset with caching
  async loadAsset(path: string): Promise<GLTF> {
    // Return cached promise if already loading/loaded
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // Create loading promise
    const loadingPromise = new Promise<GLTF>((resolve, reject) => {
      this.loader.load(
        path,
        (gltf: GLTF) => {
          // Optimize loaded asset
          this.optimizeAsset(gltf);
          loadedAssets.add(path);
          resolve(gltf);
        },
        undefined,
        (error: unknown) => {
          console.error(`Failed to load asset: ${path}`, error);
          this.loadingPromises.delete(path);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(path, loadingPromise);
    return loadingPromise;
  }

  // Optimize asset for better performance
  private optimizeAsset(gltf: GLTF): void {
    gltf.scene.traverse((child) => {
      if (child instanceof Object3D) {
        // Enable frustum culling
        child.frustumCulled = true;
        
        // Set appropriate render order for meshes
        if (child instanceof Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material: Material) => {
            // Optimize material settings
            if ('transparent' in material && !material.transparent) {
              material.alphaTest = 0.1; // Use alpha test instead of blending when possible
            }
          });
        }
      }
    });
  }

  // Preload critical assets
  async preloadCriticalAssets(): Promise<void> {
    const promises = CRITICAL_ASSETS.map(asset => 
      this.loadAsset(asset).catch(error => {
        console.warn(`Failed to preload critical asset: ${asset}`, error);
        return null;
      })
    );
    
    await Promise.allSettled(promises);
    console.log('Critical assets preloaded');
  }

  // Clean up unused assets
  cleanup(): void {
    this.loadingPromises.forEach((promise, path) => {
      if (!CRITICAL_ASSETS.includes(path)) {
        promise.then((gltf) => {
          // Dispose of geometries and materials
          gltf.scene.traverse((child) => {
            if (child instanceof Mesh) {
              if (child.geometry) {
                child.geometry.dispose();
              }
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material: Material) => {
                  material.dispose();
                  // Dispose textures
                  Object.values(material).forEach((value) => {
                    if (value instanceof Texture) {
                      value.dispose();
                    }
                  });
                });
              }
            }
          });
        });
        this.loadingPromises.delete(path);
      }
    });
    
    console.log('Non-critical assets cleaned up');
  }

  // Get loading status
  isAssetLoaded(path: string): boolean {
    return loadedAssets.has(path);
  }

  // Get all loaded assets
  getLoadedAssets(): string[] {
    return Array.from(loadedAssets);
  }
}

// React hook for lazy loading assets
export function useLazyAsset(path: string | null) {
  const loader = AssetLoader.getInstance();
  
  if (!path) return null;
  
  try {
    // This will use the cached version if already loaded
    return useLoader(GLTFLoader, path);
  } catch (error) {
    // Fallback to async loading
    console.warn(`Asset not in cache, loading async: ${path}`);
    return null;
  }
}

// Export singleton instance
export const assetLoader = AssetLoader.getInstance();