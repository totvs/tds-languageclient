import { MessageConnection, RequestType0, CancellationToken, RequestType, RequestType1, RequestType2, RequestType3, RequestType4, RequestType5, RequestType6, RequestType7, RequestType8, RequestType9 } from "vscode-jsonrpc";

export type BuildVersion = '7.00.131227A' | '7.00.170117A' | '7.00.191205P' | '7.00.210324P';

export interface TdsMessageConnection extends MessageConnection {
    sendRequest<R, E, RO>(type: RequestType0<R, E, RO>, token?: CancellationToken): Promise<R>;
    sendRequest<P, R, E, RO>(type: RequestType<P, R, E, RO>, params: P, token?: CancellationToken): Promise<R>;
    sendRequest<P1, R, E, RO>(type: RequestType1<P1, R, E, RO>, p1: P1, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, R, E, RO>(type: RequestType2<P1, P2, R, E, RO>, p1: P1, p2: P2, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, R, E, RO>(type: RequestType3<P1, P2, P3, R, E, RO>, p1: P1, p2: P2, p3: P3, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, R, E, RO>(type: RequestType4<P1, P2, P3, P4, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, P5, R, E, RO>(type: RequestType5<P1, P2, P3, P4, P5, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, P5, P6, R, E, RO>(type: RequestType6<P1, P2, P3, P4, P5, P6, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, P5, P6, P7, R, E, RO>(type: RequestType7<P1, P2, P3, P4, P5, P6, P7, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, P5, P6, P7, P8, R, E, RO>(type: RequestType8<P1, P2, P3, P4, P5, P6, P7, P8, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, token?: CancellationToken): Promise<R>;
    sendRequest<P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E, RO>(type: RequestType9<P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E, RO>, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9, token?: CancellationToken): Promise<R>;
    sendRequest<R>(method: string, ...params: any[]): Promise<R>;
}