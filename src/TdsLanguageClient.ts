import createTdsMessageConnection from './createTdsMessageConnection';
import { MessageConnection } from 'vscode-jsonrpc';
import TdsServer from './TdsServer';
import TdsMonitorServer from './TdsMonitorServer';

let instance: TdsLanguageClient = null;

export default class TdsLanguageClient {

    private connection: MessageConnection = null;
    private servers: Map<string, TdsServer> = null;

    private constructor() {
        this.connection = createTdsMessageConnection();
        this.servers = new Map();
    }

    public static instance(): TdsLanguageClient {
        if (instance === null) {
            instance = new TdsLanguageClient();
        }

        return instance;
    }

    public async getMonitorServer(token: string): Promise<TdsMonitorServer>;
    public async getMonitorServer(options: AuthenticationOptions): Promise<TdsMonitorServer>
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

            let connected = await server.connect(arg as AuthenticationOptions);

            if (connected)
                return server;
            else
                return null;
        }
    }

    public async authenticate(options: AuthenticationOptions): Promise<string> {
        return this.connection.sendRequest('$totvsserver/authentication', {
            authenticationInfo: options
        })
            .then((result: AuthenticationResult) => result.connectionToken);
    }

    /*
    public async getMonitorUsers(options: GetMonitorUsersOptions): Promise<MonitorUser[]> {
        return this.connection.sendRequest('$totvsmonitor/getUsers', {
            getUsersInfo: {
                connectionToken: options.token
            }
        });
    }
    */



}