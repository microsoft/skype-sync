import { ConfigurationValue } from ".";

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Set of attributes every host message has
 * 
 * @interface HostMessage
 */
export interface HostMessage {
    /**
     * Type of message host is sending
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    type: string;
    
    /**
     * Unique string identifier of the addin
     * 
     * @type {string}
     * @memberof HostMessage
     */
    manifestIdentifier: string;
}

/**
 * Definition of the specific attributes of the event host 
 * is sending to addins when requesting them to initialize 
 * to ready state.
 * 
 * @interface AddinInitHostMessage
 * @extends {HostMessage}
 */
export interface AddinInitHostMessage extends HostMessage {
    /**
     * Url of the addins api host
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinApiHost: string;
    
    /**
     * 
     * Token which addin will send as bearer authorization header in 
     * order to authorize itself.
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinToken: string;

    /**
     * A set of configuration properties which are to be 
     * defined per interview/meeting during the meeting creation.
     * 
     * @type {ConfigurationValue[]}
     * @memberof AddinInitHostMessage
     */
    configuration: ConfigurationValue[];

    /**
     * Set of settings which company/tenant admin sets up  on a company level
     * and which are used for every interview/meeting
     * 
     * @type {ConfigurationValue[]}
     * @memberof AddinInitHostMessage
     */
    setting: ConfigurationValue[];
}
