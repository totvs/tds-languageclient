interface AuthenticationOptions {
    connType: number;
    identification: string;
    server: string;
    port: number;
    buildVersion: BuildVersion;
    environment: string;
    user: string;
    password: string;
    autoReconnect: boolean;
}

interface AuthenticationResult {
    connectionToken: string;
}

interface MonitorUser {
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

interface GetMonitorUsersOptions {

}

declare type BuildVersion = '7.00.131227A' | '7.00.170117A';