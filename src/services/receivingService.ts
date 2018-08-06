
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
        console.log('[MM] - messageReceived - has messages: ' + hasMessages);

        batchMessage.data.forEach(message => {
            this.queue.push({
                time: batchMessage.serverTimeStamp + message.time,
                message: message
            });
        });

        console.log('[MM] - messageReceived - not sorted queue - ' + JSON.stringify(this.queue));

        sortBy(this.queue, (incomingMessage => {
            return -incomingMessage.time;
        }));

        console.log('[MM] - messageReceived - sorted queue - ' + JSON.stringify(this.queue));

        if (!hasMessages) {
            this.sendMessage();
        }
    }

    private sendMessage = () => {
        console.log('[MM] - sendMessage - queue - ' + JSON.stringify(this.queue));
        const message = this.queue.pop();
        console.log('[MM] - sendMessage - item - ' + JSON.stringify(message));
        this.syncSdk.messageHandler(message.message);

        if (this.queue.length > 0) {
            const nextMessage = this.queue[this.queue.length - 1];
            console.log('[MM] - sendMessage - next: ' + JSON.stringify(nextMessage) + ' time: ' + (nextMessage.time - message.time));
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
