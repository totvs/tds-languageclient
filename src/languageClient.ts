import { NotificationMessage } from 'vscode-jsonrpc';
import { EventEmitter } from 'events';
import { IMessageConnection, IServer, LS_CONNECTION_TYPE } from './types';
import { launchLanguageServer } from './launchLanguageServer';
import { sendConnectRequest } from './protocolMessages';
import { IConnectionInfo, IConnectionResult } from './protocolTypes';

export class TdsLanguageClient extends EventEmitter {
  private connection: IMessageConnection = null;

  constructor(options?: any) {
    super();

    const logging = options && options.logging ? options.logging : false;
    this.connection = launchLanguageServer(logging);

    this.connection.onUnhandledNotification((e: NotificationMessage) =>
      console.log(e)
    );

    this.connection.onUnhandledNotification((e: NotificationMessage) => {
      this.emit(e.method, e.params);
      //console.log(...arguments);
    });

    this.connection.onNotification('', (...params) =>
      this.emit('event', ...params)
    );
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);

    this.connection.onNotification(event, (...params) =>
      this.emit(event, ...params)
    );

    return this;
  }

  //public async getServer<T extends TdsServer>(token: string): Promise<T>;
  //public async getServer<T extends TdsServer>(options: AuthenticationOptions): Promise<T>

  // public async getServer<T extends IServer>(
  //   ServerClass: new (connection: IMessageConnection) => T,
  //   arg: any
  // ): Promise<T> {
  //   if (typeof arg === 'string') {
  //     return this.servers.get(arg) as T;
  //   }
  //   // else {
  //   //     const server = new ServerClass(this.connection);

  //   //     let connected = await server.authenticate(arg as AuthenticationOptions);

  //   //     if (connected)
  //   //         return server;
  //   //     else
  //   //         return null;
  //   // }
  //   return null;
  // }

  // public async validation(options: ValidationOptions): Promise<string> {
  //     return this.connection
  //         .sendRequest('$totvsserver/validation', {
  //             validationInfo: options
  //         })
  //         .then((result: ServerValidationResult) => result.buildVersion);
  // }

  // public async authenticate(options: AuthenticationOptions): Promise<string> {
  //     return this.connection
  //         .sendRequest('$totvsserver/authentication', {
  //             authenticationInfo: options
  //         })
  //         .then((result: ServerAuthenticationResult) => result.connectionToken);
  // }

  public connect(
    server: IServer,
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Promise<IConnectionResult> {
    if (server.connected) {
      return Promise.reject(false);
    }

    const connectionInfo: IConnectionInfo = {
      connType: connectionType,
      identification: server.id,
      serverType: server.serverType,
      serverName: server.serverName,
      server: server.address.hostname,
      port: Number.parseInt(server.address.port),
      bSecure: server.secure,
      buildVersion: server.build,
      environment: environment,
      autoReconnect: true,
    };

    const result: any = sendConnectRequest(
      this.connection,
      connectionInfo
    ).then(
      (result: IConnectionResult) => {
        return result;
      },
      (error: Error) => {
        console.log(error);
        return result;
      }
    );
    return result;
    // .then(
    //   (value: boolean) => {
    //     return value;
    //   },
    //   (value: boolean) => {
    //     return value;
    //   }
    // );
  }
}

const options: any = process.argv;
export const tdsLanguageClient: TdsLanguageClient = new TdsLanguageClient(
  options
);
