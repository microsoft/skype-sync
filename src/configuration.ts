export class SyncConfiguration {
    public maximumMessages: number;
    public maximumSize: number;
    public messageSendRate: number;
    public maximumConnectionAttempmts: number;
    public connectionRetryDelay: number;

    constructor() {
        this.maximumMessages = 50;
        this.maximumSize = 128 * 1024;
        this.messageSendRate = 200;
        this.maximumConnectionAttempmts = 5;
        this.connectionRetryDelay = 500;
    }
}

export default new SyncConfiguration();
