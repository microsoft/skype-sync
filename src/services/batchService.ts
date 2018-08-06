import { AddinsHub } from '../interfaces';
import { BatchMessage, Message } from '../models';

const BATCH_MESSAGE = 200;
const MAXIMUM_MESSAGES = 100;
const MAXIMUM_SIZE = 128 * 1024;

export class BatchService {
    private addinsHub: AddinsHub;
    private errorHandler: (message: string, ...optionalParams: any[]) => void;

    private timestamp?: number;
    private batchMessage: BatchMessage;
    private currentSize: number;

    constructor() {
        this.batchMessage = new BatchMessage();
        this.currentSize = 0;
    }

    public init = (addinsHub: AddinsHub, errorHandler: (message: string, ...optionalParams: any[]) => void) => {
        this.addinsHub = addinsHub;
        this.errorHandler = errorHandler;
    }

    public queueMessage = (message: Message) => {
        const currentTimeStamp = Date.now();

        this.updateSize(message);
        if (this.currentSize > MAXIMUM_SIZE) {
            this.errorHandler('[BatchService]:queueMessage - Maximum Size of the payload reached');
            return;
        }

        if (this.batchMessage.data.length === MAXIMUM_MESSAGES) {
            this.errorHandler('[BatchService]:queueMessage - Message Rate Limit Reach');
            return;
        }
        
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
                this.errorHandler('[BatchService]:sendBatchMessage - FAIL', e);
            });
        this.timestamp = undefined;
        this.batchMessage = new BatchMessage();
        this.currentSize = 0;
    }

    private updateSize(message: Message) {
        this.currentSize += 32;
        if (message.payload) {
            this.currentSize += (encodeURI(message.payload).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1);
        }
    }
}

export default new BatchService();
