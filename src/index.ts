// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { SkypeHub } from './synchronization/skypeHub';

import { AddinMessage, InitAddinMessage } from './hostMessage';
import { AddinsHub, SkypeSync } from './interfaces';
import { AddinReadyMessage, ConnectionState, CoreInitContext, InitContext, Message } from './models';
import { NullHub } from './synchronization/nullHub';

export * from './hostMessage';
export * from './models';
export * from './interfaces';

export const addinEvents = {
    addinReady: 'skype-sync-addinReady',
    init: 'skype-sync-init',
    auth: 'skype-sync-auth',
    telemetry: 'skype-sync-telemetry',
    unlock: 'skype-sync-unlock'
};

class Sync implements SkypeSync {

    public initHandler: (context: InitContext) => void;

    public messageHandler: (message: Message) => void;
    public errorHandler: (message: string, ...optionalParams: any[]) => void;

    public connectionHandler: (connectionState: ConnectionState) => void;

    private origin: string;
    private host: string;
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
            this.errorHandler('Skype sync is not initialized. Wait for the init handler to be fired.');
            return;
        }

        const addinUrl = `${this.addinsHub}/hubs/addins`;
        return this.addinsHub.connect(addinUrl, this.addinToken)
            .then(() => {
                this.connectionHandler(ConnectionState.Connected);
                console.log('[SkypeSync]::onHostRequestedInit-connected', addinUrl);
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

        if (type === addinEvents.unlock) {
            this.sendUnlockMessageToHost();
            return;
        }

        if (payload) {
            message.payload = JSON.stringify(payload);
        }

        this.addinsHub.sendMessage(message)
            .catch(e => {
                this.errorHandler('[SkypeSync]:persistContent  FAIL', e, message);
            });
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
                this.errorHandler('[SkypeSync]:persistContent FAIL', e, content);
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
                this.errorHandler('[SkypeSync]:fetchContext - error', e);
            });
    }

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        if (!messageEvent || messageEvent.source === window || !messageEvent.data || !messageEvent.origin) {
            return;
        }

        if (this.origin && messageEvent.origin !== this.origin) {
            return;
        }

        const hostMessage: AddinMessage = JSON.parse(messageEvent.data);
        if (!hostMessage || !hostMessage.type) {
            return;
        }

        console.log('[SkypeSync]:onHostMessageReceived - processing message', messageEvent);

        switch (hostMessage.type) {
            case addinEvents.init:
                this.onHostRequestedInit(hostMessage as InitAddinMessage);
                break;
            default:
                console.warn('[SkypeSync]:onHostMessageReceived - Unknown host message of type:' + hostMessage.type);
        }
    }

    private onHostRequestedInit(data: InitAddinMessage) {
        console.log('[SkypeSync]::onHostRequestedInit', data);

        this.host = data.addinApiHost;
        this.origin = data.origin;
        this.addinToken = data.addinToken;

        if (this.host) {
            this.addinsHub = new SkypeHub(this);
        } else {
            this.addinsHub = new NullHub();
            this.connectionHandler(ConnectionState.Connected);
        }

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

        this.errorHandler = (message: string, ...optionalParams: any[]) => {
            console.error('[SkypeSync]:errorHandler-' + message, optionalParams);
        };

        this.connectionHandler = (connectionState: ConnectionState) => {
            console.log('[SkypeSync]:connectionHandler', connectionState);
        };
    }

    private indicateReadyStateIfNeeded = () => {
        if (!window.parent) {
            return;
        }

        const message: AddinReadyMessage = {
            type: addinEvents.addinReady
        };
        window.parent.postMessage(JSON.stringify(message), '*');
    }

    private sendUnlockMessageToHost() {
        if (!window.parent) {
            return;
        }

        const message: AddinReadyMessage = {
            type: addinEvents.unlock
        };
        window.parent.postMessage(JSON.stringify(message), '*');
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

        const sessionUserId = Date.now().toString();
        const addinId = 'test-addin-' + sessionUserId;
        const data: InitAddinMessage = {
            addinApiHost: context.apiHost || 'https://everest-dev-hub.azurewebsites.net', // || 'https://localhost:3000',
            addinSessionId: addinSessionId,
            addinSessionUserId: sessionUserId,
            manifestIdentifier: addinId,
            sessionId: addinSessionId,
            type: addinEvents.init,
            configuration: context.configuration || [],
            origin: context.origin || 'http://localhost:3000',
            addinToken: JSON.stringify({
                adid: addinId,
                asid: addinSessionId,
                auid: sessionUserId,
                sid: addinSessionId
            }),
            language: 'en'
        };
        console.log('[SkypeSync]::___devInit -> starting...', data);
        this.onHostRequestedInit(data);
    }
}

export default new Sync();
