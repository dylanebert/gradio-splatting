import { hardware_types } from "./utils.js";
import type { EventType, EventListener, PostResponse, UploadResponse, SpaceStatusCallback } from "./types.js";
import type { Config } from "./types.js";
type event = <K extends EventType>(eventType: K, listener: EventListener<K>) => SubmitReturn;
type predict = (endpoint: string | number, data?: unknown[], event_data?: unknown) => Promise<unknown>;
type client_return = {
    predict: predict;
    config: Config;
    submit: (endpoint: string | number, data?: unknown[], event_data?: unknown) => SubmitReturn;
    component_server: (component_id: number, fn_name: string, data: unknown[]) => any;
    view_api: (c?: Config) => Promise<ApiInfo<JsApiData>>;
};
type SubmitReturn = {
    on: event;
    off: event;
    cancel: () => Promise<void>;
    destroy: () => void;
};
export declare let NodeBlob: any;
export declare function duplicate(app_reference: string, options: {
    hf_token: `hf_${string}`;
    private?: boolean;
    status_callback: SpaceStatusCallback;
    hardware?: (typeof hardware_types)[number];
    timeout?: number;
}): Promise<client_return>;
interface Client {
    post_data: (url: string, body: unknown, token?: `hf_${string}`) => Promise<[PostResponse, number]>;
    upload_files: (root: string, files: File[], token?: `hf_${string}`) => Promise<UploadResponse>;
    client: (app_reference: string, options: {
        hf_token?: `hf_${string}`;
        status_callback?: SpaceStatusCallback;
        normalise_files?: boolean;
    }) => Promise<client_return>;
    handle_blob: (endpoint: string, data: unknown[], api_info: ApiInfo<JsApiData>, token?: `hf_${string}`) => Promise<unknown[]>;
}
export declare function api_factory(fetch_implementation: typeof fetch, WebSocket_factory: (url: URL) => WebSocket): Client;
export declare const post_data: (url: string, body: unknown, token?: `hf_${string}`) => Promise<[PostResponse, number]>, upload_files: (root: string, files: File[], token?: `hf_${string}`) => Promise<UploadResponse>, client: (app_reference: string, options: {
    hf_token?: `hf_${string}`;
    status_callback?: SpaceStatusCallback;
    normalise_files?: boolean;
}) => Promise<client_return>, handle_blob: (endpoint: string, data: unknown[], api_info: ApiInfo<JsApiData>, token?: `hf_${string}`) => Promise<unknown[]>;
interface ApiData {
    label: string;
    type: {
        type: any;
        description: string;
    };
    component: string;
    example_input?: any;
}
interface JsApiData {
    label: string;
    type: string;
    component: string;
    example_input: any;
}
interface EndpointInfo<T extends ApiData | JsApiData> {
    parameters: T[];
    returns: T[];
}
interface ApiInfo<T extends ApiData | JsApiData> {
    named_endpoints: {
        [key: string]: EndpointInfo<T>;
    };
    unnamed_endpoints: {
        [key: string]: EndpointInfo<T>;
    };
}
export declare function walk_and_store_blobs(param: any, type?: any, path?: any[], root?: boolean, api_info?: any): Promise<{
    path: string[];
    type: string;
    blob: Blob | false;
}[]>;
export {};
//# sourceMappingURL=client.d.ts.map