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