import { MessageConnection } from "vscode-jsonrpc";
import { ReconnectOptions, ServerAuthenticationResult, AuthenticationOptions } from './TdsLanguageClient';
import createTdsMessageConnection from "./createTdsMessageConnection";
import { BuildVersion } from "./types";

export default class TdsServer {

    public id: string = null;
    public token: string = null;
    public address: string = null;
    public port: number = -1;
    public build: BuildVersion = null;

    protected connection: MessageConnection = null;

    public constructor(connection?: MessageConnection) {
        if (connection) {
            this.connection = connection;
        }
        else {
            this.connection = createTdsMessageConnection();
        }
    }


    public async authenticate(options: AuthenticationOptions): Promise<boolean> {
        return this.connection
            .sendRequest('$totvsserver/authentication', {
                authenticationInfo: options
            })
            .then(
                (result: ServerAuthenticationResult) => {
                    this.token = result.connectionToken;

                    return true;
                },
                ((error: Error) => {
                    return false
                }));
    }

    public async connect(options: ConnectOptions): Promise<boolean> {
        const authenticationInfo: AuthenticationOptions = {
            connType: 1,
            identification: this.id,
            server: this.address,
            port: this.port,
            buildVersion: this.build,
            autoReconnect: true,
            user: options.username,
            password: options.password,
            environment: options.environment
        };

        return this.connection
            .sendRequest('$totvsserver/authentication', {
                authenticationInfo: authenticationInfo
            })
            .then(
                (result: ServerAuthenticationResult) => {
                    this.token = result.connectionToken;

                    return true;
                },
                ((error: Error) => {
                    return false
                }));
    }

    public async reconnect(options: ReconnectOptions): Promise<boolean> {
        return this.connection
            .sendRequest('$totvsserver/reconnect', {
                reconnectInfo: {
                    connectionToken: options.token,
                    serverName: this.id
                }
            }).then((result: ServerReconnectResult) => {

                return true;
            })
    }

    public async validate(): Promise<boolean> {
        if ((this.address === null) || (this.port === -1))
            return false;

        return this.connection
            .sendRequest('$totvsserver/validation', {
                validationInfo: {
                    server: this.address,
                    port: this.port
                }
            })
            .then(
                (result: ServerValidationResult) => {
                    this.build = result.buildVersion;
                    this.id = result.id;

                    return true;
                },
                ((error: Error) => {
                    return false
                }));
    }
}

export interface ConnectOptions {
    environment: string;
    username: string;
    password: string;
}


interface ServerValidationResult {
    id: string;
    buildVersion: BuildVersion;
}

interface ServerReconnectResult {
    connectionToken: string;
    environment: string;
    user: string;
}