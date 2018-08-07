import BaseEvent from './baseEvent';

export default class HubConnectionEvent extends BaseEvent {
    constructor() {
        super('sync_hub_startConnection');
    }
}
