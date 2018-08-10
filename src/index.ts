// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { SkypeHub } from './synchronization/skypeHub';

import configuration from './configuration';
import { AddinMessage, InitAddinMessage } from './hostMessage';
import { AddinsHub, SkypeSync } from './interfaces';
import { AddinEvents, AddinHostMessage, ConnectionState, CoreInitContext, ErrorCodes, InitContext, Message } from './models';
import batchService from './services/batchService';
import HubConnectionEvent from './services/telemetry/hubConnectionEvent';
import telemetryService from './services/telemetryService';
import { NullHub } from './synchronization/nullHub';

export * from './hostMessage';
export * from './models';
export * from './interfaces';

export class Sync implements SkypeSync {

    public initHandler: (context: InitContext) => void;

    public messageHandler: (message: Message) => void;
    public errorHandler: (erroCode: ErrorCodes, e?: any) => void;

    public connectionHandler: (connectionState: ConnectionState) => void;

    private origin: string;
    private addinsHub: AddinsHub;

    private addinToken: string;

    constructor() {
        this.defaultListeners();
        window.addEventListener('message', this.onHostMessageReceived);
        this.indicateReadyStateIfNeeded();
    }

    /**
     * Connects SkypeSync to the Signaling Service.
     * 
     * @memberof SkypeSync
     */
    public connect(): Promise<void> {
        if (!this.addinsHub) {
            this.errorHandler(ErrorCodes.NotInitialized);
            return;
        }

        const addinUrl = `${configuration.addinApiHost}/hubs/addins`;
        return this.addinsHub.connect(addinUrl, this.addinToken)
            .then(() => {
                this.connectionHandler(ConnectionState.Connected);
                console.log('[SkypeSync]::connect-connected', addinUrl);
            })
            .catch(e => {
                const connectionEvent = new HubConnectionEvent();
                connectionEvent.data.push({ name: 'exception', value: JSON.stringify(e) });
                telemetryService.sendTelemetryData(connectionEvent);
                this.errorHandler(ErrorCodes.ConnectionFailed, e);
            });
    }

    /**
     * Send a message through the host to other participants 
     * using addin at the same time
     * 
     * @param {string} type 
     * @param {*} [payload] 
     * @memberof Sync
     */
    public sendMessage(type: string, payload?: any) {
        const message: Message = {
            type: type
        };

        if (type === AddinEvents.unlock) {
            this.sendUnlockMessageToHost();
            return;
        }

        if (payload) {
            message.payload = JSON.stringify(payload);
        }

        batchService.queueMessage(message);
    }

    /**
     * Saves the given context in a way which allows it later to be restored
     * so addin can set initial state to the persisted state and user can continue session.
     * 
     * @param {*} content 
     * @memberof Sync
     */
    public persistContent(content: any) {
        this.addinsHub.storeContext(JSON.stringify(content))
            .catch(e => {
                this.errorHandler(ErrorCodes.PersistContentStoreFailed, e);
            });
    }

    /**
     * Fetch the content of previous addin session state so user can continue his addin session. 
     * 
     * @returns {(Promise<string|void>)} 
     * @memberof Sync
     */
    public fetchContent(): Promise<string | void> {
        return this.addinsHub.fetchContext()
            .catch(e => {
                this.errorHandler(ErrorCodes.PersistContentFetchFailed, e);
            });
    }

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        if (!messageEvent
            || messageEvent.source === window
            || !messageEvent.data
            || !(typeof messageEvent.data === 'string')
            || !messageEvent.origin) {
            return;
        }

        if (this.origin && messageEvent.origin !== this.origin) {
            return;
        }

        if (!this.origin) {
            this.origin = messageEvent.origin;
        }

        const hostMessage: AddinMessage = JSON.parse(messageEvent.data);
        if (!hostMessage || !hostMessage.type) {
            return;
        }

        console.log('[SkypeSync]:onHostMessageReceived - processing message', messageEvent);

        switch (hostMessage.type) {
            case AddinEvents.init:
                this.onHostRequestedInit(hostMessage as InitAddinMessage);
                break;
            default:
                console.warn('[SkypeSync]:onHostMessageReceived - Unknown host message of type:' + hostMessage.type);
        }
    }

    private onHostRequestedInit(data: InitAddinMessage) {
        console.log('[SkypeSync]::onHostRequestedInit', data);

        telemetryService.init(this.origin, data.manifestIdentifier);

        configuration.readFromHostData(data.hubconfiguration);
        this.addinToken = data.addinToken;

        if (configuration.addinApiHost) {
            this.addinsHub = new SkypeHub(this);
        } else {
            this.addinsHub = new NullHub();
            this.connectionHandler(ConnectionState.Connected);
        }

        batchService.init(this.addinsHub, this.errorHandler);

        const context: InitContext = {
            addinSessionId: data.addinSessionId,
            addinSessionUserId: data.addinSessionUserId,
            configuration: data.configuration,
            sessionId: data.sessionId,
            token: data.addinToken,
            language: data.language
        };
        this.initHandler(context);
    }

    private defaultListeners() {
        this.initHandler = (context: InitContext) => {
            console.log('[SkypeSync]:initHandler', context);
        };

        this.messageHandler = (message: Message) => {
            console.log('[SkypeSync]:messageHandler', message);
        };

        this.errorHandler = (errorCode: ErrorCodes, e?: any) => {
            console.error('[SkypeSync]:errorHandler-errorCode:' + errorCode, e);
        };

        this.connectionHandler = (connectionState: ConnectionState) => {
            console.log('[SkypeSync]:connectionHandler', connectionState);
        };
    }

    private indicateReadyStateIfNeeded = () => {
        if (!window.parent) {
            return;
        }

        const message: AddinHostMessage = {
            type: AddinEvents.addinReady
        };
        window.parent.postMessage(JSON.stringify(message), this.origin ? this.origin : '*');
    }

    private sendUnlockMessageToHost() {
        if (!window.parent) {
            return;
        }

        const message: AddinHostMessage = {
            type: AddinEvents.unlock
        };
        window.parent.postMessage(JSON.stringify(message), this.origin ? this.origin : '*');
    }

    /**
     * Initialize the SDK in the development mode suitable for addin development.
     * This method should not be used in production as the host will invoke it
     * with the real parameters which will be accepted by the addin api server.
     * (NOT FOR PRODUCTION USE, ONLY FOR ADDIN DEVELOPERS)
     * 
     * @param {string} addinSessionId 
     * Unique addin session id which is the same for all the users
     * collaborating in a given addin.
     * @param {CoreInitContext} context 
     * Addin initialization context enabling frictionless local development of the 
     * Skype Interview addins.
     * @memberof SkypeSync
     */
    // tslint:disable-next-line member-ordering
    public ___devInit(addinSessionId: string, context?: CoreInitContext) {

        if (!context) {
            context = {};
        }

        const currentTime = Date.now();
        const sessionUserId = currentTime.toString();
        const addinId = 'test-addin-' + new Date(currentTime).getMonth() + '-' + new Date(currentTime).getDate();
        const data: InitAddinMessage = {
            addinSessionId: addinSessionId,
            addinSessionUserId: sessionUserId,
            manifestIdentifier: addinId,
            sessionId: addinSessionId,
            type: AddinEvents.init,
            configuration: context.configuration || [],
            origin: context.origin || 'http://localhost:3000',
            addinToken: JSON.stringify({
                adid: addinId,
                asid: addinSessionId,
                auid: sessionUserId,
                sid: addinSessionId
            }),
            language: 'en',
            hubconfiguration: {
                addinApiHost: context.apiHost || 'https://everest-dev-hub.azurewebsites.net', // || 'https://localhost:3000',
                maximumConnectionAttempmts: 1,
                maximumMessages: 10,
                maximumSize: 128 * 1024,
                messageSendRate: 200,
                connectionRetryDelay: 500
            }
        };
        console.log('[SkypeSync]::___devInit -> starting...', data);
        this.onHostRequestedInit(data);
    }
}

export default new Sync();
