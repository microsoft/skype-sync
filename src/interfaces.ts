// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BatchMessage, ConnectionState, CoreInitContext, InitContext, Message } from './models';

/**
 * Contracts the public behaviors Skype Sync SDK provides to the hosts using it 
 * to build Skype interviews addins
 * 
 * @export
 * @interface SkypeSync
 */
export interface SkypeSync {

    /**
     * Connects SkypeSync to the Signal Service.
     * 
     * @memberof SkypeSync
     */
    connect: () => Promise<void>;

    /**
     * Handler which will be invoked once the addin is initialized and ready for work.
     * 
     * @memberof SkypeSync
     */
    initHandler: (context: InitContext) => void;

    /**
     * Event handler handling the receiving of a message from other addin session users.
     * 
     * @memberof SkypeSync
     */
    messageHandler: (message: Message) => void;

    /**
     * 
     * Event handler which is handling the errors occurring in the sdk.
     * 
     * @memberof SkypeSync
     */
    errorHandler: (e: any) => void;

    /**
     * 
     * Event handler which is handling the changes of the connection state changes.
     * 
     * @memberof SkypeSync
     */
    connectionHandler: (connectionState: ConnectionState) => void;

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
    ___devInit(addinSessionId: string, context?: CoreInitContext);
}

export interface AddinsHub {

    /**
     * Sends a message to the hub to the other users participating in the same addin session.
     * 
     * @param {BatchMessage} message 
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    sendMessage(message: BatchMessage): Promise<void>;
    
    /**
     * Initialize the connection with the socket server endpoint 
     * located on a given endpoint
     * 
     * @param {string} url 
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    connect(url: string, token: string): Promise<void>;
    
     /**
     * Sends a command to the hub to persist given addin session context for later use
     * 
     * @param {string} context Addin session context which needs to be persisted on the server for later use.
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    
    storeContext(context: string): Promise<void>;
    
    /**
     * Retrieve previously persisted context from the hub.
     * 
     * @returns {Promise<string>} Previously persisted context (if any)
     * @memberof AddinsHub
     */
    fetchContext(): Promise<string>;
}
