import { TelemetryPayload, TelemetryPayloadValue } from '../../models';

export default abstract class BaseEvent implements TelemetryPayload {
    public name: string;
    public data: TelemetryPayloadValue[];

    constructor(name: string) {
        this.name = name;
        this.data = [];
    }
}
