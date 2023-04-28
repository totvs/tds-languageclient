import createTdsMessageConnection from "./createTdsMessageConnection";
import { BuildVersion, TdsMessageConnection } from "./types";
import { MonitorUser } from "./TdsMonitorServer";

enum LS_SERVER_TYPE {
    PROTHEUS = 1,
    LOGIX = 2,
    TOVSTECX = 3
}

export default class TdsServer {

    public isConnected: boolean = false;
    public id: string = null;
    public token: string = null;
    public serverType: LS_SERVER_TYPE = null; // 1:Protheus, 2:Logix, 3:TotvstecX
    public address: string = null;
    public port: number = -1;
    public serverTypeAsString: string = null;
    public build: BuildVersion = null;
    public secure = true;
    public environment: string = null;
    public lastGetUsers: number = 0;
    public usersList: MonitorUser[] = [];

    protected connection: TdsMessageConnection = null;

    public constructor(connection?: TdsMessageConnection) {
        if (connection) {
            this.connection = connection;
        }
        else {
            this.connection = createTdsMessageConnection(false);
        }
    }

    public async connect(identification: string, serverType: number, server: string, port: number, secure: boolean, buildVersion: BuildVersion, environment: string): Promise<boolean> {
        const connectionInfo: ConnectOptions = {
            connType: 13,
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
                    this.isConnected = !result.needAuthentication;
                    return true;
                },
                ((error: Error) => {
                    this.token = null;
                    console.log(error);
                    return false
                }));
    }

    public async authenticate(user: string, password: string, encoding?: ServerEncoding): Promise<boolean> {
        const authenticationInfo: AuthenticationOptions = {
            connectionToken: this.token,
            user: user,
            password: password,
            environment: this.environment,
            encoding: encoding
        };

        return this.connection
            .sendRequest('$totvsserver/authentication', {
                authenticationInfo: authenticationInfo
            })
            .then(
                (result: ServerAuthenticationResult) => {
                    this.token = result.connectionToken;
                    this.isConnected = true;
                    return true;
                },
                ((error: Error) => {
                    this.token = null;
                    console.log(error);
                    return false
                }));

    }

    public async disconnect(): Promise<string> {
        return this.connection
            .sendRequest('$totvsserver/disconnect', {
                disconnectInfo: {
                    connectionToken: this.token,
                    serverName: this.id
                }
            })
            .then((response: DisconnectResult) => {
                this.isConnected = false;

                return response.message
            });
    }

    public async reconnect(options?: Partial<ReconnectOptions>): Promise<boolean> {
        const reconnectInfo: ReconnectOptions = Object.assign({
            connType: 13,
            connectionToken: this.token,
            serverName: this.id
        }, options || {});

        return this.connection
            .sendRequest('$totvsserver/reconnect', {
                reconnectInfo: reconnectInfo
            })
            .then((result: ServerReconnectResult) => {
                this.token = result.connectionToken;
                this.isConnected = true;

                return true;
            })
            .catch((error: Error) => {
                console.log(error);

                return false
            });
    }

    public async validate(): Promise<boolean> {
        if ((this.address === null) || (this.port === -1))
            return false;

        if(!this.serverTypeAsString || this.serverTypeAsString.trim.length === 0) {
            this.serverTypeAsString = this.getServerTypeString();
        }

        const tryValidate = ((): Promise<boolean> => {
            const validationInfo: ValidationOptions = {
                server: this.address,
                port: this.port,
                serverType: this.serverTypeAsString,
                connType: 13
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

    private getServerTypeString(): string {
        switch(this.serverType){
            case LS_SERVER_TYPE.LOGIX:
                return "totvs_server_logix";
            case LS_SERVER_TYPE.PROTHEUS:
                return "totvs_server_protheus";
            case LS_SERVER_TYPE.TOVSTECX:
                return "totvs_server_totvstec";
            default:
                return "";
        }
    }
}

declare type ServerEncoding = 'CP1252' | 'CP1251';

interface ValidationOptions {
    server: string;
    port: number;
    serverType: string;
    connType: number;
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
    encoding: ServerEncoding;
}

interface ReconnectOptions {
    connectionToken: string;
    serverName: string;
    connType: number;
    encoding?: ServerEncoding
}

interface ServerValidationResult {
    buildVersion: BuildVersion | '';
    secure: number;
}

interface ServerConnectionResult {
    id: any;
    osType: number;
    connectionToken: string;
    needAuthentication: boolean;
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

interface DisconnectResult {
    message: string;
}
