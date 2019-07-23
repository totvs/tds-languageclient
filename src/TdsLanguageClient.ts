import createTdsMessageConnection from './createTdsMessageConnection';
import { MessageConnection, NotificationMessage } from 'vscode-jsonrpc';
import TdsServer from './TdsServer';
import TdsMonitorServer from './TdsMonitorServer';
import { EventEmitter } from 'events';
import { BuildVersion } from './types';

let instance: TdsLanguageClient = null;

export default class TdsLanguageClient extends EventEmitter {

    private connection: MessageConnection = null;
    private servers: Map<string, TdsServer> = null;

    private constructor() {
        super();

        this.connection = createTdsMessageConnection();
        this.servers = new Map();

        //this.connection.onUnhandledNotification(e: NotificationMessage) =>  console.log(e));

        this.connection.onUnhandledNotification((e: NotificationMessage) => {
            this.emit(e.method, e.params);
            //console.log(...arguments);
        });


        //this.connection.onNotification('', (...params) => this.emit('event', ...params))
    }

    /*
    public on(event: string, listener: (...args: any[]) => void): this {
        super.on(event, listener);

        this.connection.onNotification(event, (...params) => this.emit(event, ...params))

        return this;
    }
    */

    public static instance(): TdsLanguageClient {
        if (instance === null) {
            instance = new TdsLanguageClient();
        }

        return instance;
    }

    public createMonitorServer(): TdsMonitorServer {
        return new TdsMonitorServer(this.connection);
    }

    public async getMonitorServer(token: string): Promise<TdsMonitorServer>;
    public async getMonitorServer(options: AuthenticationOptions): Promise<TdsMonitorServer>;
    public async getMonitorServer(arg: any): Promise<TdsMonitorServer> {
        return this.getServer(TdsMonitorServer, arg);
    };

    //public async getServer<T extends TdsServer>(token: string): Promise<T>;
    //public async getServer<T extends TdsServer>(options: AuthenticationOptions): Promise<T>

    public async getServer<T extends TdsServer>(ServerClass: new (connection: MessageConnection) => T, arg: any): Promise<T> {
        if (typeof arg === 'string') {
            return this.servers.get(arg) as T;
        }
        else {
            const server = new ServerClass(this.connection);

            let connected = await server.authenticate(arg as AuthenticationOptions);

            if (connected)
                return server;
            else
                return null;
        }
    }

    public async validation(options: ValidationOptions): Promise<string> {
        return this.connection
            .sendRequest('$totvsserver/validation', {
                validationInfo: options
            })
            .then((result: ServerValidationResult) => result.buildVersion);
    }

    public async authenticate(options: AuthenticationOptions): Promise<string> {
        return this.connection
            .sendRequest('$totvsserver/authentication', {
                authenticationInfo: options
            })
            .then((result: ServerAuthenticationResult) => result.connectionToken);
    }

}


export interface ValidationOptions {
    server: string;
    port: number;
}

export interface ServerValidationResult {
    buildVersion: BuildVersion;
}

export interface AuthenticationOptions {
    connType: number;
    identification: string;
    server: string;
    port: number;
    buildVersion: BuildVersion;
    environment: string;
    user: string;
    password: string;
    autoReconnect: boolean;
}

export interface ServerAuthenticationResult {
    id: any;
    osType: number;
    connectionToken: string;
}

export interface AuthenticationResult {
    token: string;
}

export interface ReconnectOptions {
    token: string;
    servername: string;
}

export interface ReconnectResult {
    token: string;
    environment: string;
    username: string;


}