import { AddinEvents, AddinHostMessage, TelemetryPayload } from '../models';

export class TelemetryService {
    private host = '*';
    private addinIdentifier: string;
    private correlationId: string;
    private sessionId: string;

    public init = (host: string, addinIdentifier: string, correlationId: string, sessionId: string) => {
        this.host = host;
        this.addinIdentifier = addinIdentifier;
        this.correlationId = correlationId;
        this.sessionId = sessionId;
    }

    public sendTelemetryData = (telemetryPayload: TelemetryPayload) => {
        if (!window.parent) {
            return;
        }

        telemetryPayload.data.push({ name: 'identifier', value: this.addinIdentifier });
        telemetryPayload.data.push({ name: 'correlationId', value: this.correlationId });
        telemetryPayload.data.push({ name: 'sessionId', value: this.sessionId });
        const message: AddinHostMessage = {
            type: AddinEvents.telemetry,
            payload: JSON.stringify(telemetryPayload)
        };
        window.parent.postMessage(JSON.stringify(message), this.host || '*');
    }
}

export default new TelemetryService();
