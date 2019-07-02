import TdsServer from "./TdsServer";

export default class TdsMonitorServer extends TdsServer {

    public async getUsers(): Promise<MonitorUser[]> {
        return this.connection
            .sendRequest('$totvsmonitor/getUsers', {
                getUsersInfo: {
                    connectionToken: this.token
                }
            })
            .then((response: any) => response.mntUsers);
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