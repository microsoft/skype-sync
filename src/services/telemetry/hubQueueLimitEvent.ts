import BaseEvent from './baseEvent';

export default class HubQueueLimitEvent extends BaseEvent {
    constructor() {
        super('sync_hub_queueLimit');
    }
}
