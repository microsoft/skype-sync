import { AddinEvents, AddinHostMessage, TelemetryPayload } from '../models';

export class TelemetryService {
    private host = '*';
    private addinIdentifier: string;

    public init = (host: string, addinIdentifier: string) => {
        this.host = host;
        this.addinIdentifier = addinIdentifier;
    }

    public sendTelemetryData = (telemetryPayload: TelemetryPayload) => {
        if (!window.parent) {
            return;
        }

        telemetryPayload.data.push({ name: 'identifier', value: this.addinIdentifier });
        const message: AddinHostMessage = {
            type: AddinEvents.telemetry,
            payload: JSON.stringify(telemetryPayload)
        };
        window.parent.postMessage(JSON.stringify(message), this.host || '*');
    }
}

export default new TelemetryService();
