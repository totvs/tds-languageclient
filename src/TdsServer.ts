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
    public serverType: LS_SERVER_TYPE = null; // 1:Protheus, 2:Logix, 3:TotvstecX
    public address: string = null;
    public port: number = -1;
    public build: BuildVersion = null;
    public secure = true;
    public environment: string = null;

    protected connection: TdsMessageConnection = null;

    public constructor(connection?: TdsMessageConnection) {
        if (connection) {
            this.connection = connection;
        }
        else {
            this.connection = createTdsMessageConnection();
        }
    }

    public async connect(identification: string, serverType: number, server: string, port: number, secure: boolean, buildVersion: BuildVersion, environment: string): Promise<boolean> {
        const connectionInfo: ConnectOptions = {
            connType: 1,
            serverName: identification,
            identification: identification,
            serverType: serverType,
            server: server,
            port: port,
            bSecure: secure ? 1 : 0,
            buildVersion: buildVersion,
            autoReconnect: true,
            environment: environment
        };

        return this.connection
            .sendRequest('$totvsserver/connect', {
                connectionInfo: connectionInfo
            })
            .then(
                (result: ServerConnectionResult) => {
                    this.token = result.connectionToken;
                    this.environment = environment;

                    return true;
                },
                ((error: Error) => {
                    this.token = null;
                    console.log(error);
                    return false
                }));
    }

    public async authenticate(user: string, password: string): Promise<boolean> {
        const tryAuthenticate = (): Promise<boolean> => {
            const authenticationInfo: AuthenticationOptions = {
                connectionToken: this.token,
                user: user,
                password: password,
                environment: this.environment
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
                        this.token = null;
                        console.log(error);
                        return false
                    }));
        };

        return await tryAuthenticate();
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
        this.token = null;
    }

    public async reconnect(connectionToken?: string): Promise<boolean> {
        if (connectionToken) {
            this.token = connectionToken;
        }
        const reconnectInfo: ReconnectOptions = {
            connectionToken: this.token,
            serverName: this.id
        };

        return this.connection
            .sendRequest('$totvsserver/reconnect', {
                reconnectInfo: reconnectInfo
            }).then((result: ServerReconnectResult) => {
                return true;
            },
                ((error: Error) => {
                    this.token = null;
                    console.log(error);
                    return false
                }));
    }

    public async validate(): Promise<boolean> {
        if ((this.address === null) || (this.port === -1))
            return false;

        const tryValidate = ((): Promise<boolean> => {
            const validationInfo: ValidationOptions = {
                server: this.address,
                port: this.port
            };

            return this.connection
                .sendRequest<ServerValidationResult>('$totvsserver/validation', {
                    validationInfo: validationInfo
                })
                .then(
                    (result: ServerValidationResult) => {
                        console.log('$totvsserver/validation', result);

                        if (!result.buildVersion)
                            return false;

                        this.build = result.buildVersion;
                        this.secure = (result.secure == 1);

                        return true;
                    },
                    ((error: Error) => {
                        console.log(error);
                        return false
                    }));
        });

        return await tryValidate();
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

interface ValidationOptions {
    server: string;
    port: number;
}

interface ConnectOptions {
    connType: number;
    serverName: string;
    identification: string;
    serverType: number;
    server: string;
    port: number;
    bSecure: number;
    buildVersion: BuildVersion;
    environment: string;
    autoReconnect: boolean;
}

interface AuthenticationOptions {
    connectionToken: string;
    environment: string;
    user: string;
    password: string;
}

interface ReconnectOptions {
    connectionToken: string;
    serverName: string;
}

interface ServerValidationResult {
    buildVersion: BuildVersion | '';
    secure: number;
}

interface ServerConnectionResult {
    id: any;
    osType: number;
    connectionToken: string;
}

interface ServerAuthenticationResult {
    id: any;
    connectionToken: string;
}

interface ServerReconnectResult {
    connectionToken: string;
    environment: string;
    user: string;
}
