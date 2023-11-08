import { upload_files } from "./client";
export declare function normalise_file(file: FileData | null, server_url: string, proxy_url: string | null): FileData | null;
export declare function normalise_file(file: FileData[] | null, server_url: string, proxy_url: string | null): FileData[] | null;
export declare function normalise_file(file: FileData[] | FileData | null, server_url: string, // root: string,
proxy_url: string | null): FileData[] | FileData | null;
export declare function get_fetchable_url_or_file(path: string | null, server_url: string, proxy_url: string | null): string;
export declare function upload(file_data: FileData[], root: string, upload_fn?: typeof upload_files): Promise<(FileData | null)[] | null>;
export declare function prepare_files(files: File[], is_stream?: boolean): Promise<FileData[]>;
export declare class FileData {
    path: string;
    url?: string;
    orig_name: string;
    size?: number;
    blob?: File;
    is_stream?: boolean;
    mime_type?: string;
    alt_text?: string;
    constructor({ path, url, orig_name, size, blob, is_stream, mime_type, alt_text }: {
        path: string;
        url?: string;
        orig_name: string;
        size?: number;
        blob?: File;
        is_stream?: boolean;
        mime_type?: string;
        alt_text?: string;
    });
}
//# sourceMappingURL=upload.d.ts.map