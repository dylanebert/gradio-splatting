import type { Config } from "./types.js";
/**
 * This function is used to resolve the URL for making requests when the app has a root path.
 * The root path could be a path suffix like "/app" which is appended to the end of the base URL. Or
 * it could be a full URL like "https://abidlabs-test-client-replica--gqf2x.hf.space" which is used when hosting
 * Gradio apps on Hugging Face Spaces.
 * @param {string} base_url The base URL at which the Gradio server is hosted
 * @param {string} root_path The root path, which could be a path suffix (e.g. mounted in FastAPI app) or a full URL (e.g. hosted on Hugging Face Spaces)
 * @param {boolean} prioritize_base Whether to prioritize the base URL over the root path. This is used when both the base path and root paths are full URLs. For example, for fetching files the root path should be prioritized, but for making requests, the base URL should be prioritized.
 * @returns {string} the resolved URL
 */
export declare function resolve_root(base_url: string, root_path: string, prioritize_base: boolean): string;
export declare function determine_protocol(endpoint: string): {
    ws_protocol: "ws" | "wss";
    http_protocol: "http:" | "https:";
    host: string;
};
export declare const RE_SPACE_NAME: RegExp;
export declare const RE_SPACE_DOMAIN: RegExp;
export declare function process_endpoint(app_reference: string, token?: `hf_${string}`): Promise<{
    space_id: string | false;
    host: string;
    ws_protocol: "ws" | "wss";
    http_protocol: "http:" | "https:";
}>;
export declare function map_names_to_ids(fns: Config["dependencies"]): Record<string, number>;
export declare function discussions_enabled(space_id: string): Promise<boolean>;
export declare function get_space_hardware(space_id: string, token: `hf_${string}`): Promise<(typeof hardware_types)[number]>;
export declare function set_space_hardware(space_id: string, new_hardware: (typeof hardware_types)[number], token: `hf_${string}`): Promise<(typeof hardware_types)[number]>;
export declare function set_space_timeout(space_id: string, timeout: number, token: `hf_${string}`): Promise<number>;
export declare const hardware_types: readonly ["cpu-basic", "cpu-upgrade", "t4-small", "t4-medium", "a10g-small", "a10g-large", "a100-large"];
//# sourceMappingURL=utils.d.ts.map