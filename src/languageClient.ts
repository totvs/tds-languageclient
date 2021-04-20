import { NotificationMessage } from 'vscode-jsonrpc';
import TdsMonitorServer from './monitorServer';
import { EventEmitter } from 'events';
import { IMessageConnection, IServer } from './types';
import { createConnectionTunnel } from './connectionTunnel';

let instance: TdsLanguageClient = null;

export default class TdsLanguageClient extends EventEmitter {
  private connection: IMessageConnection = null;
  private servers: Map<string, IServer> = null;

  private constructor(options?: any) {
    super();

    const logging = options && options.logging ? options.logging : false;
    this.connection = createConnectionTunnel(logging);
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

  public static instance(options?: any): TdsLanguageClient {
    if (instance === null) {
      instance = new TdsLanguageClient(options);
    }

    return instance;
  }

  public createMonitorServer(): TdsMonitorServer {
    return null; //new TdsMonitorServer(this.connection);
  }

  public async getMonitorServer(token: string): Promise<TdsMonitorServer>;
  //public async getMonitorServer(options: AuthenticationOptions): Promise<TdsMonitorServer>;
  public async getMonitorServer(arg: any): Promise<TdsMonitorServer> {
    return null; //this.getServer(TdsMonitorServer, arg);
  }

  //public async getServer<T extends TdsServer>(token: string): Promise<T>;
  //public async getServer<T extends TdsServer>(options: AuthenticationOptions): Promise<T>

  public async getServer<T extends IServer>(
    ServerClass: new (connection: IMessageConnection) => T,
    arg: any
  ): Promise<T> {
    if (typeof arg === 'string') {
      return this.servers.get(arg) as T;
    }
    // else {
    //     const server = new ServerClass(this.connection);

    //     let connected = await server.authenticate(arg as AuthenticationOptions);

    //     if (connected)
    //         return server;
    //     else
    //         return null;
    // }
    return null;
  }

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
}
