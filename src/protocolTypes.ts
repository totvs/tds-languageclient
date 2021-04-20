export interface IConnectionInfo {
  connType: number;
  serverName: string;
  identification: string;
  serverType: number;
  server: string;
  port: number;
  buildVersion: string;
  bSecure: boolean;
  environment: string;
  autoReconnect: boolean;
}

export interface IConnectionResult {
  id: any;
  osType: number;
  connectionToken: string;
  needAuthentication: boolean;
}

interface AuthenticationNode {
  // These properties come directly from the language server.
  id: any;
  osType: number;
  connectionToken: string;
}

interface ITokenInfo {
  sucess: boolean;
  token: string;
  needAuthentication: boolean;
}

interface IAuthenticationInfo {
  sucess: boolean;
  token: string;
}

interface IReconnectInfo {
  sucess: boolean;
  token: string;
  environment: string;
  user: string;
}

interface IValidationInfo {
  build: string;
  secure: boolean;
}

interface ReconnectNode {
  connectionToken: string;
  environment: string;
  user: string;
}

interface NodeInfo {
  id: any;
  buildVersion: string;
  secure: number;
}

interface DisconnectReturnInfo {
  id: any;
  code: any;
  message: string;
}
