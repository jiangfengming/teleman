export declare type PrimitiveType = string | number | boolean | null | undefined;
export declare type SerializableData = string | number | boolean | null | undefined | SerializableData[] | {
    [name: string]: SerializableData;
};
export declare type ReqOptions = {
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
    [index: string]: any;
};
export declare type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'PURGE';
export declare type MethodLowercase = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'purge';
export declare type ReqBody = string | FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
export declare type MiddlewareCtx = {
    url: URL;
    options: {
        method: Method;
        headers: Headers;
        body: ReqBody;
    };
    parseResponseBody: boolean;
    response?: Response;
    [name: string]: any;
};
export declare type Middleware = (ctx: MiddlewareCtx, next: () => Promise<any>) => Promise<any>;
export declare type Query = string | Record<string, PrimitiveType> | [string, PrimitiveType][];
export declare type FormBody = Record<string, PrimitiveType | Blob> | [string, PrimitiveType | Blob, string?][];
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
    fetch(path: string, { method, base, headers, query, params, body, parseResponseBody, throwFailedResponse, use, useBefore, useAfter, ...rest }?: ReqOptions): Promise<any>;
    get(path: string, query?: Query, options?: ReqOptions): Promise<any>;
    post(path: string, body?: ReqBody, options?: ReqOptions): Promise<any>;
    put(path: string, body?: ReqBody, options?: ReqOptions): Promise<any>;
    patch(path: string, body?: ReqBody, options?: ReqOptions): Promise<any>;
    delete(path: string, query?: Query, options?: ReqOptions): Promise<any>;
    head(path: string, query?: Query, options?: ReqOptions): Promise<any>;
    purge(path: string, query?: Query, options?: ReqOptions): Promise<any>;
}
export default Teleman;
export { Teleman };
export declare const teleman: Teleman;
