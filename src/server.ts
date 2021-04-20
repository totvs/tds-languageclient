import {
  BuildVersion,
  IMessageConnection,
  IServer,
  IServerOperations,
  LS_CONNECTION_TYPE,
  LS_SERVER_TYPE,
} from './types';

import { Url } from 'url';
import { createConnectionTunnel } from './connectionTunnel';
import { IConnectionInfo } from './protocolTypes';
import { sendConnectRequest } from './protocolMessages';

export class ServerInformation implements IServer, IServerOperations {
  private _id: string = null;
  private _serverName: string;
  private _connected: boolean = false;
  private _token: string = null;
  private _serverType: LS_SERVER_TYPE = null;
  private _address: Url = null;
  private _build: BuildVersion = null;
  private _secure = true;
  private _environment: string = null;
  private _connection: IMessageConnection = null;

  public get serverName(): string {
    return this._serverName;
  }

  public set serverName(value: string) {
    this._serverName = value;
  }

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
  }
  public get connected(): boolean {
    return this._connected;
  }
  public set connected(value: boolean) {
    this._connected = value;
  }
  public get token(): string {
    return this._token;
  }
  public set token(value: string) {
    this._token = value;
  }
  public get serverType(): LS_SERVER_TYPE {
    return this._serverType;
  }
  public set serverType(value: LS_SERVER_TYPE) {
    this._serverType = value;
  }
  public get address(): Url {
    return this._address;
  }
  public set address(value: Url) {
    this._address = value;
  }
  public get build(): BuildVersion {
    return this._build;
  }
  public set build(value: BuildVersion) {
    this._build = value;
  }
  public get secure() {
    return this._secure;
  }
  public set secure(value) {
    this._secure = value;
  }
  public get environment(): string {
    return this._environment;
  }
  public set environment(value: string) {
    this._environment = value;
  }
  public get connection(): IMessageConnection {
    return this._connection;
  }
  public set connection(value: IMessageConnection) {
    this._connection = value;
  }

  public constructor(connection?: IMessageConnection) {
    this._connection = !connection ? connection : createConnectionTunnel(false);
  }

  public connect(
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Promise<boolean> {
    if (this.connected) {
      return Promise.reject(false);
    }

    const connectionInfo: IConnectionInfo = {
      connType: connectionType,
      identification: this.id,
      serverType: this.serverType,
      serverName: this.serverName,
      server: this.address.hostname,
      port: Number.parseInt(this.address.port),
      bSecure: this.secure,
      buildVersion: this.build,
      environment: environment,
      autoReconnect: true,
    };

    const result: any = sendConnectRequest(
      this.connection,
      connectionInfo
    ).then(
      (result: ServerConnectionResult) => {
        this.token = result.connectionToken;
        this.environment = environment;
        this.connected = !result.needAuthentication;
        return true;
      },
      (error: Error) => {
        this.token = null;
        console.log(error);
        return false;
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

  public async authenticate(
    user: string,
    password: string,
    encoding?: ServerEncoding
  ): Promise<boolean> {
    const authenticationInfo: AuthenticationOptions = {
      connectionToken: this.token,
      user: user,
      password: password,
      environment: this.environment,
      encoding: encoding,
    };

    return this.connection
      .sendRequest('$totvsserver/authentication', {
        authenticationInfo: authenticationInfo,
      })
      .then(
        (result: ServerAuthenticationResult) => {
          this.token = result.connectionToken;
          this.isConnected = true;
          return true;
        },
        (error: Error) => {
          this.token = null;
          console.log(error);
          return false;
        }
      );
  }

  public async disconnect(): Promise<string> {
    return this.connection
      .sendRequest('$totvsserver/disconnect', {
        disconnectInfo: {
          connectionToken: this.token,
          serverName: this.id,
        },
      })
      .then((response: DisconnectResult) => {
        this.isConnected = false;

        return response.message;
      });
  }

  public async reconnect(
    options?: Partial<ReconnectOptions>
  ): Promise<boolean> {
    const reconnectInfo: ReconnectOptions = Object.assign(
      {
        connType: 13,
        connectionToken: this.token,
        serverName: this.id,
      },
      options || {}
    );

    return this.connection
      .sendRequest('$totvsserver/reconnect', {
        reconnectInfo: reconnectInfo,
      })
      .then((result: ServerReconnectResult) => {
        this.token = result.connectionToken;
        this.isConnected = true;

        return true;
      })
      .catch((error: Error) => {
        console.log(error);

        return false;
      });
  }

  public async validate(): Promise<boolean> {
    if (this.address === null || this.port === -1) return false;

    const tryValidate = (): Promise<boolean> => {
      const validationInfo: ValidationOptions = {
        server: this.address,
        port: this.port,
        connType: 13,
      };

      return this.connection
        .sendRequest<ServerValidationResult>('$totvsserver/validation', {
          validationInfo: validationInfo,
        })
        .then(
          (result: ServerValidationResult) => {
            console.log('$totvsserver/validation', result);

            if (!result.buildVersion) return false;

            this.build = result.buildVersion;
            this.secure = result.secure == 1;

            return true;
          },
          (error: Error) => {
            console.log(error);
            return false;
          }
        );
    };

    return await tryValidate();
  }

  public async stopServer() {
    this.connection
      .sendRequest('$totvsserver/stopServer', {
        stopServerInfo: {
          connectionToken: this.token,
        },
      })
      .then((response: any) => response.message);
  }
}

declare type ServerEncoding = 'CP1252' | 'CP1251';

interface ValidationOptions {
  server: string;
  port: number;
  connType: number;
}

export interface ServerConnectionInfo {
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
  encoding?: ServerEncoding;
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
