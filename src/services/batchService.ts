import { AddinsHub } from '../interfaces';
import { BatchMessage, Message } from '../models';

const BATCH_MESSAGE = 500;

export class BatchService {
    private addinsHub: AddinsHub;
    private errorHandler: (message: string, ...optionalParams: any[]) => void;

    private timestamp?: number;
    private batchMessage: BatchMessage;

    constructor() {
        this.batchMessage = new BatchMessage();
    }

    public init = (addinsHub: AddinsHub, errorHandler: (message: string, ...optionalParams: any[]) => void) => {
        this.addinsHub = addinsHub;
        this.errorHandler = errorHandler;
    }

    public queueMessage = (message: Message) => {
        const currentTimeStamp = Date.now();
        
        if (!this.timestamp) {
            this.timestamp = currentTimeStamp;
            setTimeout(this.sendBatchMessage, BATCH_MESSAGE);
        }

        message.time = currentTimeStamp - this.timestamp;
        this.batchMessage.data.push(message);
    }

    private sendBatchMessage = () => {
        this.addinsHub.sendMessage(this.batchMessage)
            .catch(e => {
                this.errorHandler('[BatchService]:sendBatchMessage  FAIL', e);
            });
        this.timestamp = undefined;
        this.batchMessage = new BatchMessage();
    }
}

export default new BatchService();
