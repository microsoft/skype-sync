import { HubConfiguration } from './hostMessage';

export class SyncConfiguration {
    public maximumMessages: number;
    public maximumSize: number;
    public messageSendRate: number;
    public maximumConnectionAttempmts: number;
    public connectionRetryDelay: number;
    public addinApiHost: string;

    public readFromHostData(data: HubConfiguration) {
        this.maximumConnectionAttempmts = data.maximumConnectionAttempmts;
        this.maximumMessages = data.maximumMessages;
        this.maximumSize = data.maximumSize;
        this.messageSendRate = data.messageSendRate;
        this.connectionRetryDelay = data.connectionRetryDelay;
        this.addinApiHost = data.addinApiHost;
    }
}

export default new SyncConfiguration();
