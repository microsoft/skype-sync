import { SkypeSync } from '../interfaces';
import { BatchMessage } from '../models';

export class ReceivingService {
    private syncSdk: SkypeSync;

    public init = (syncSdk: SkypeSync) => {
        this.syncSdk = syncSdk;
    }

    public messageReceived = (batchMessage: BatchMessage) => {
        batchMessage.data.forEach(message => {
            this.syncSdk.messageHandler(message);
        });
    }
}

export default new ReceivingService();
