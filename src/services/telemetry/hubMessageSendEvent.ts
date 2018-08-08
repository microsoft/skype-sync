import BaseEvent from './baseEvent';

export default class HubMessageSendEvent extends BaseEvent {
    constructor() {
        super('sync_hub_messageSent');
    }
}
