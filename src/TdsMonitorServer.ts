import TdsServer from "./TdsServer";

export default class TdsMonitorServer extends TdsServer {

    public async disconnect() {
        this.connection
            .sendRequest('$totvsmonitor/disconnect', {
                disconnectInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: any) => response.message);
    }

    public async getUsers(): Promise<MonitorUser[]> {
        return this.connection
            .sendRequest('$totvsmonitor/getUsers', {
                getUsersInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: any) => response.mntUsers);
    }

    public async appKillUser(userName: string, computerName: string, threadId: number, serverName: string) {
        this.connection
            .sendRequest('$totvsmonitor/appKillUser', {
                killUsappKillUserInfoerInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName
                }
            })
            .then((response: any) => response.message);
    }

    public async killUser(userName: string, computerName: string, threadId: number, serverName: string) {
        this.connection
            .sendRequest('$totvsmonitor/killUser', {
                killUserInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName
                }
            })
            .then((response: any) => response.message);
    }

    public async sendUserMessage(userName: string, computerName: string, threadId: number, serverName: string, message: string) {
        this.connection
            .sendRequest('$totvsmonitor/sendUserMessage', {
                sendUserMessageInfo: {
                    connectionToken: this.token,
                    userName: userName,
                    computerName: computerName,
                    threadId: threadId,
                    serverName: serverName,
                    message: message
                }
            })
            .then((response: any) => response.message);
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
}