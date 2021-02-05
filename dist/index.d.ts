declare type PrimitiveType = string | number | boolean | null | undefined;
declare type SerializableData = string | number | boolean | null | undefined | SerializableData[] | {
    [name: string]: SerializableData;
};
declare type ReqOptions = {
    method?: Method | MethodLowercase;
    base?: string;
    headers?: Headers | Record<string, string>;
    query?: URLSearchParams | string | Record<string, PrimitiveType> | [string, PrimitiveType][];
    params?: Record<string, string | number | boolean>;
    body?: ReqBody | SerializableData;
    parseResponseBody?: boolean;
    throwFailedResponse?: boolean;
    use?: Middleware[];
    useBefore?: Middleware[];
    useAfter?: Middleware[];
    [name: string]: unknown;
};
declare type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'PURGE';
declare type MethodLowercase = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'purge';
declare type ReqBody = string | FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
declare type MiddlewareCtx = {
    url: URL;
    options: {
        method: Method;
        headers: Headers;
        body: ReqBody;
    };
    parseResponseBody: boolean;
    response?: Response;
    [name: string]: unknown;
};
declare type Middleware = (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<unknown>;
declare type Query = string | Record<string, PrimitiveType> | [string, PrimitiveType][];
declare class Teleman {
    base?: string;
    headers?: Headers | Record<string, string>;
    parseResponseBody: boolean;
    throwFailedResponse: boolean;
    middleware: Middleware[];
    constructor({ base, headers, parseResponseBody, throwFailedResponse }?: {
        base?: string;
        headers?: Headers | Record<string, string>;
        parseResponseBody?: boolean;
        throwFailedResponse?: boolean;
    });
    use(middleware: Middleware, beginning?: boolean): void;
    fetch(path: string, { method, base, headers, query, params, body, parseResponseBody, throwFailedResponse, use, useBefore, useAfter, ...rest }?: ReqOptions): Promise<unknown>;
    get(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown>;
    post(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown>;
    put(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown>;
    patch(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown>;
    delete(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown>;
    head(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown>;
    purge(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown>;
}
export default Teleman;
export { Teleman };
export declare const teleman: Teleman;
