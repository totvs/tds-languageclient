import { ReconnectOptions, ServerAuthenticationResult, AuthenticationOptions } from './TdsLanguageClient';
import createTdsMessageConnection from "./createTdsMessageConnection";
import { BuildVersion, TdsMessageConnection } from "./types";

enum LS_SERVER_TYPE {
    PROTHEUS = 1,
    LOGIX = 2,
    TOVSTECX = 3
}


export default class TdsServer {

    public id: string = null;
    public token: string = null;
    public address: string = null;
    public port: number = -1;
    public build: BuildVersion = null;
    public secure = true;

    protected connection: TdsMessageConnection = null;

    public constructor(connection?: TdsMessageConnection) {
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


        const tryAuthenticate = (serverType: LS_SERVER_TYPE): Promise<boolean> => {
            const authenticationInfo: AuthenticationOptions = {
                connType: 1,
                identification: this.id,
                server: this.address,
                port: this.port,
                buildVersion: this.build,
                autoReconnect: true,
                user: options.username,
                password: options.password,
                environment: options.environment,
                bSecure: this.secure ? 1 : 0,
                serverType: serverType
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
        };

        if (await tryAuthenticate(LS_SERVER_TYPE.PROTHEUS)) {
            console.log('tryAuthenticate LS_SERVER_TYPE.PROTHEUS');

            return true;
        }
        else if (await tryAuthenticate(LS_SERVER_TYPE.TOVSTECX)) {
            console.log('tryAuthenticate LS_SERVER_TYPE.TOVSTECX');

            return true;
        }
        else {
            console.log('tryAuthenticate FAILED');

            return false;
        }

        /*
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
                */
    }

    public async disconnect() {
        this.connection
            .sendRequest('$totvsserver/disconnect', {
                disconnectInfo: {
                    connectionToken: this.token,
                    serverName: this.id
                }
            })
            .then((response: any) => response.message);
    }

    public async reconnect(options?: ReconnectOptions): Promise<boolean> {
        if ((options) && (options.token)) {
            this.token = options.token;
        }

        return this.connection
            .sendRequest('$totvsserver/reconnect', {
                reconnectInfo: {
                    connectionToken: this.token,
                    serverName: this.id
                }
            }).then((result: ServerReconnectResult) => {
                return true;
            },
                ((error: Error) => {
                    return false
                }));
    }

    public async validate(): Promise<boolean> {
        if ((this.address === null) || (this.port === -1))
            return false;

        const tryValidate = ((secure: boolean): Promise<boolean> => {
            return this.connection
                .sendRequest<ServerValidationResult>('$totvsserver/validation', {
                    validationInfo: {
                        server: this.address,
                        port: this.port,
                        bSecure: secure ? 1 : 0
                    }
                })
                .then(
                    (result: ServerValidationResult) => {
                        console.log('$totvsserver/validation', result);

                        if (!result.buildVersion)
                            return false;

                        this.build = result.buildVersion;
                        this.id = result.id;

                        return true;
                    },
                    ((error: Error) => {
                        console.log(error);

                        return false
                    }));


        });

        if (await tryValidate(true)) {
            console.log('tryValidate true');

            this.secure = true;
            return true;
        }
        else if (await tryValidate(false)) {
            console.log('tryValidate false');

            this.secure = false;
            return true;
        }
        else {
            console.log('tryValidate failed');

            return false;
        }

        /*
        return this.connection
            .sendRequest('$totvsserver/validation', {
                validationInfo: {
                    server: this.address,
                    port: this.port,
                    bSecure: false
                }
            })
            .then(
                (result: ServerValidationResult) => {
                    console.log('$totvsserver/validation', result);
 
                    this.build = result.buildVersion;
                    this.id = result.id;
 
                    return true;
                },
                ((error: Error) => {
                    return false
                }));
                */
    }

    public async stopServer() {
        this.connection
            .sendRequest('$totvsserver/stopServer', {
                stopServerInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: any) => response.message);
    }
}

export interface ConnectOptions {
    environment: string;
    username: string;
    password: string;
}

interface ServerValidationResult {
    id: string;
    buildVersion: BuildVersion | '';
}

interface ServerReconnectResult {
    connectionToken: string;
    environment: string;
    user: string;
}