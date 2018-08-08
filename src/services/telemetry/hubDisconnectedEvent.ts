import BaseEvent from './baseEvent';

export default class HubDisconnectedEvent extends BaseEvent {
    constructor() {
        super('sync_hub_disconnected');
    }
}
