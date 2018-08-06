
import sortBy = require('lodash.sortby');

import { SkypeSync } from '../interfaces';
import { BatchMessage, Message } from '../models';

export class ReceivingService {
    private syncSdk: SkypeSync;

    private queue: IncomingMessage[] = [];

    public init = (syncSdk: SkypeSync) => {
        this.syncSdk = syncSdk;
    }

    public messageReceived = (batchMessage: BatchMessage) => {
        const hasMessages = this.queue.length > 0;

        batchMessage.data.forEach(message => {
            this.queue.push({
                time: batchMessage.serverTimeStamp + message.time,
                message: message
            });
        });

        sortBy(this.queue, (incomingMessage => {
            return incomingMessage.time;
        }));

        if (!hasMessages) {
            this.sendMessage();
        }
    }

    private sendMessage = () => {
        const message = this.queue.pop();
        this.syncSdk.messageHandler(message.message);

        if (this.queue.length > 0) {
            const nextMessage = this.queue[this.queue.length - 1];
            setTimeout(() => {
                this.sendMessage();
            }, nextMessage.time - message.time);
        }
    }
}

interface IncomingMessage {
    time: number;
    message: Message;
}

export default new ReceivingService();
