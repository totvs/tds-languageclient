import TdsServer from "./TdsServer";

export default class TdsMonitorServer extends TdsServer {

    public async getUsers(): Promise<MonitorUser[]> {
        if (!this.isConnected) {
            return [];
        }

        const timeInMs = Date.now();
        
        if (timeInMs - this.lastGetUsers < 1000) {
            return this.usersList;
        }

        this.lastGetUsers = timeInMs;
        
        return this.sendGetUsersMessage(timeInMs);
    }

    private sendGetUsersMessage(timeInMs: number): Promise<MonitorUser[]> {
        return this.connection
            .sendRequest('$totvsmonitor/getUsers', {
                getUsersInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: GetUsersResponse) => {
                console.log("...getUsers: "+(Date.now()-timeInMs)+" ms");

                this.usersList = response.mntUsers
                
                return this.usersList;
            },
                (() => {
                    return null
                })
            );
    }

    public async appKillUser(userName: string, computerName: string, threadId: number, serverName: string, environment: string): Promise<string> {
        return this.connection
            .sendRequest('$totvsmonitor/appKillUser', {
                appKillUserInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName,
                    environment: environment
                }
            })
            .then((response: AppKillUserResponse) => response.message);
    }

    public async killUser(userName: string, computerName: string, threadId: number, serverName: string, environment: string): Promise<string> {
        return this.connection
            .sendRequest('$totvsmonitor/killUser', {
                killUserInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName,
                    environment: environment
                }
            })
            .then((response: KillUserResponse) => response.message);
    }

    public async sendUserMessage(userName: string, computerName: string, threadId: number, serverName: string, message: string, environment: string): Promise<string> {
        return this.connection
            .sendRequest('$totvsmonitor/sendUserMessage', {
                sendUserMessageInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName,
                    message: message,
                    environment: environment
                }
            })
            .then((response: SendUserMessageResponse) => response.message);
    }

    public async getConnectionStatus(): Promise<boolean> {
        return this.connection
            .sendRequest('$totvsmonitor/getConnectionStatus', {
                getConnectionStatusInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: GetConnectionStatusResponse) => response.status);
    }

    public async setConnectionStatus(status: boolean): Promise<string> {
        return this.connection
            .sendRequest('$totvsmonitor/setConnectionStatus', {
                setConnectionStatusInfo: {
                    connectionToken: this.token,
                    status: status
                }
            })
            .then((response: SetConnectionStatusResponse) => response.message);
    }
}

export interface MonitorUser {
    username: string;
    computerName: string;
    threadId: number;
    server: string;
    mainName: string;
    environment: string;
    loginTime: string;
    elapsedTime: string;
    totalInstrCount: number;
    instrCountPerSec: number;
    remark: string;
    memUsed: number;
    sid: string;
    ctreeTaskId: number;
    clientType: string;
    inactiveTime: string;
    appUser: string;
}

export interface GetUsersResponse {
    mntUsers: Array<MonitorUser>
}

export interface SendUserMessageResponse {
    message: string;
}

export interface KillUserResponse {
    message: string;
}

export interface AppKillUserResponse {
    message: string;
}

export interface SetConnectionStatusResponse {
    message: string;
}

export interface GetConnectionStatusResponse {
    status: boolean;
}

