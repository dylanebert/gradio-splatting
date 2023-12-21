import type { Scene } from "../core/Scene";
import { Splat } from "../splats/Splat";
declare class Loader {
    static LoadAsync(url: string, scene: Scene, onProgress?: (progress: number) => void, useCache?: boolean): Promise<Splat>;
    static LoadFromFileAsync(file: File, scene: Scene, onProgress?: (progress: number) => void): Promise<Splat>;
}
export { Loader };
