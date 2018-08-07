export class SyncConfiguration {
    public maximumMessages: number;
    public maximumSize: number;
    public messageSendRate: number;

    constructor() {
        this.maximumMessages = 200;
        this.maximumSize = 128 * 1024;
        this.messageSendRate = 200;
    }
}

export default new SyncConfiguration();
