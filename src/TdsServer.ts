import { MessageConnection } from "vscode-jsonrpc";



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
                (result: AuthenticationResult) => {
                    this.token = result.connectionToken;

                    return true;
                },
                ((error: Error) => {
                    return false
                }));
    }

}