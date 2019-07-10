import { MessageConnection } from "vscode-jsonrpc";
import { AuthenticationOptions, ReconnectOptions, ServerAuthenticationResult } from './TdsLanguageClient';



export default class TdsServer {

    public token: string = null;

    protected connection: MessageConnection = null;

    public constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    public async connect(options: AuthenticationOptions): Promise<boolean> {
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

    public async reconnect(options: ReconnectOptions): Promise<boolean> {
        return this.connection
            .sendRequest('$totvsserver/reconnect', {
                reconnectInfo: {
                    connectionToken: options.token,
                    serverName: options.servername
                }
            }).then((result: ServerReconnectResult) => {

                return true;
            })
    }
}


interface ServerReconnectResult {
    connectionToken: string;
	environment: string;
	user: string;
}