import BaseEvent from './baseEvent';

export default class HubSizeLimitEvent extends BaseEvent {
    constructor() {
        super('sync_hub_sizeLimit');
    }
}
