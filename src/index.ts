// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {SkypeHub}  from './synchronization/skypeHub';

import {AddinMessage, InitAddinMessage } from './hostMessage';
import { Message, ConfigurationValue, CoreInitContext, InitContext } from './models';
import { SkypeSync, AddinsHub } from './interfaces';
import { NullHub } from './synchronization/nullHub';

export * from './hostMessage';
export * from './models';
export * from './interfaces';

export const addinEvents = {
    init: 'skype-sync-init',
    auth: 'skype-sync-auth',
    telemetry: 'skype-sync-telemetry',
}

export class Sync implements SkypeSync {

    public initHandler: (context: InitContext) => void
    
    public  messageHandler: (message: Message) => void;
    public  contextFetchHandler: (context: string) => void;
    public  errorHandler: (message: string, ...optionalParams: any[]) => void;

    private origin: string;
    private host: string;
    private addinContext: InitContext;
    private addinsHub: AddinsHub;

    private lastHostMessage: string;

    constructor() {
        this.defaultListeners();
        window.addEventListener('message', this.onHostMessageReceived);
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

        if (payload) {
            message.payload = JSON.stringify(payload);
        }

        this.addinsHub.sendMessage(message)
            .catch(e => {
                this.errorHandler("[SkypeSync]:persistContent  FAIL", e, message);
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
                this.errorHandler("[SkypeSync]:persistContent FAIL", e, content);
            });
    }

    /**
     * Fetch the content of previous addin session state so user can continue his addin session. 
     * 
     * @memberof Sync
     */
    public fetchContent() : Promise<string> {
        return new Promise<string>((success, fail) => {
            var timeout = setTimeout(() => {
                fail(this.errorHandler("[SkypeSync]::fetchContent-timeout 5000"));
            }, 5000)

            this.contextFetchHandler = (payload: string) => {
                console.log("[SkypeSync]:contextFetched", payload);
                success(JSON.parse(payload));
                clearTimeout(timeout);
            };
            
            this.addinsHub.fetchContext()
                .catch(e => {
                    this.errorHandler("[SkypeSync]:fetchContent FAIL", e);
                });
        })
    }
    
    

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        
        if (!messageEvent || messageEvent.source === window || !messageEvent.data || messageEvent.origin != this.origin) {
            return;
        }

        if (this.lastHostMessage == messageEvent.data) {

        }

        console.log('[SkypeSync]:onHostMessageReceived - processing message', messageEvent);

        const hostMessage: AddinMessage = JSON.parse(messageEvent.data);
        switch (hostMessage.type) {
            case addinEvents.init:
                // host requested init;
                this.onHostRequestedInit(<InitAddinMessage>hostMessage);
                break;
            default:
                this.errorHandler("[SkypeSync]:onHostMessageReceived - Unknown host message of type:" + hostMessage.type);
        }
    }

    private onHostRequestedInit(data: InitAddinMessage) 
    {
        console.log('[SkypeSync]::onHostRequestedInit', data);

        this.host = data.addinApiHost;
        this.origin = data.origin;

        if (this.host) {
            this.addinsHub = new SkypeHub(this);
        } else {
            this.addinsHub = new NullHub();
        }

        var addinUrl = `${data.addinApiHost}/hubs/addins?token=${data.addinToken}`;

        this.addinsHub.connect(addinUrl)
            .then(() => {
                console.log('[SkypeSync]::onHostRequestedInit-connected', addinUrl);
                var context: InitContext = {
                    addinSessionId: data.addinSessionId,
                    addinSessionUserId: data.addinSessionUserId,
                    configuration: data.configuration,
                    sessionId: data.sessionId,
                    settings: data.setting,
                    token: data.addinToken,
                };
                this.initHandler(context);
            })
    }
    
    private defaultListeners() {

        this.initHandler  = (context: InitContext) => {
            console.log("[SkypeSync]:initHandler", context);
        }

        this.messageHandler  = (message: Message) => {
            console.log("[SkypeSync]:messageHandler", message);
        }

        this.contextFetchHandler  = (context: string) => {
            console.log("[SkypeSync]:contextFetchHandler", context);
        }

        this.errorHandler  = (message: string, ...optionalParams: any[]) => {
            console.error("[SkypeSync]:errorHandler-" + message, optionalParams);
        }
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
    public ___devInit(addinSessionId: string, context?: CoreInitContext) {
        
        if (!context) {
            context = {};
        }

        const sessionUserId = Date.now().toString();
        const addinId = "test-addin-" + sessionUserId;
        const data: InitAddinMessage = {
            addinApiHost: context.apiHost || 'https://everest-dev-hub.azurewebsites.net', // || 'https://localhost:3000',
            addinSessionId: addinSessionId,
            addinSessionUserId: sessionUserId,
            manifestIdentifier: addinId,
            sessionId: addinSessionId,
            type: addinEvents.init,
            setting: context.settings || [],
            configuration: context.configuration || [],
            origin: context.origin || 'http://localhost:3000',
            addinToken: JSON.stringify({
                adid: addinId,
                asid: addinSessionId,
                auid: sessionUserId,
                sid: addinSessionId
            }),
        }
        console.log('[SkypeSync]::___devInit -> starting...', data);
        this.onHostRequestedInit(data);
    }
}

export default new Sync();
