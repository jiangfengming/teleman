export type PrimitiveType = string | number | boolean | null | undefined;
export type SerializableData = string | number | boolean | null | undefined | SerializableData[] | {
    [name: string]: SerializableData;
};
export type ReqOptions = {
    method?: Method | MethodLowercase;
    base?: string;
    headers?: Headers | Record<string, string>;
    query?: URLSearchParams | string | Record<string, PrimitiveType> | [string, PrimitiveType][];
    params?: Record<string, string | number | boolean>;
    body?: ReqBody | SerializableData;
    use?: Middleware[];
    [index: string]: unknown;
};
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "PURGE";
export type MethodLowercase = "get" | "post" | "put" | "delete" | "patch" | "head" | "purge";
export type ReqBody = string | FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
export type MiddlewareCtx = {
    url: URL;
    options: {
        method: Method;
        headers: Headers;
        body: ReqBody;
    };
    response?: Response;
    [name: string]: unknown;
};
export type Middleware = (ctx: MiddlewareCtx, next: () => Promise<any>) => unknown;
export type Query = string | Record<string, PrimitiveType> | [string, PrimitiveType][];
export type FormBody = Record<string, PrimitiveType | Blob> | [string, PrimitiveType | Blob, string?][];
declare class Teleman {
    base?: string;
    headers: Headers;
    middleware: Middleware[];
    constructor({ base, headers, }?: {
        base?: string;
        headers?: Headers | Record<string, string>;
    });
    use(middleware: Middleware): this;
    fetch<T>(path: string, { method, base, headers, query, params, body, use, ...rest }?: ReqOptions): Promise<T>;
    get<T>(path: string, query?: Query, options?: ReqOptions): Promise<T>;
    post<T>(path: string, body?: ReqBody | SerializableData, options?: ReqOptions): Promise<T>;
    put<T>(path: string, body?: ReqBody | SerializableData, options?: ReqOptions): Promise<T>;
    patch<T>(path: string, body?: ReqBody | SerializableData, options?: ReqOptions): Promise<T>;
    delete<T>(path: string, query?: Query, options?: ReqOptions): Promise<T>;
    head<T>(path: string, query?: Query, options?: ReqOptions): Promise<T>;
    purge<T>(path: string, query?: Query, options?: ReqOptions): Promise<T>;
}
export default Teleman;
export { Teleman };
export declare const teleman: Teleman;
