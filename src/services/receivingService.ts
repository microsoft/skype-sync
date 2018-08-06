
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

        this.queue = this.queue.sort((a, b) => b.time - a.time);

        if (!hasMessages) {
            this.sendMessage();
        }
    }

    private sendMessage = () => {
        const message = this.queue.pop();
        this.syncSdk.messageHandler(message.message);

        if (this.queue.length > 0) {
            const nextMessage = this.queue[this.queue.length - 1];
            const nextTime = nextMessage.time - message.time;
            if (nextTime <= 0) {
                this.sendMessage();
            } else {
                setTimeout(() => {
                    this.sendMessage();
                }, nextTime);
            }
        }
    }
}

interface IncomingMessage {
    time: number;
    message: Message;
}

export default new ReceivingService();
