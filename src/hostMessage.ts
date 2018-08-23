// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConfigurationValue } from './models';

/**
 * Set of attributes every message host sends to addins has
 * 
 * @interface AddinMessage
 */
export interface AddinMessage {
    /**
     * Type of message host is sending
     * 
     * @type {string}
     * @memberof AddinMessage
     */
    type: string;

    /**
     * Unique string identifier of the addin
     * 
     * @type {string}
     * @memberof AddinMessage
     */
    manifestIdentifier: string;
}

/**
 * Definition of the specific attributes of the event host 
 * is sending to addins when requesting them to initialize 
 * to ready state.
 * 
 * @interface AddinInitHostMessage
 * @extends {AddinMessage}
 */
export interface InitAddinMessage extends AddinMessage {

    /**
     * Unique hashed session id addin has in a given meeting 
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinSessionId: string;

    /**
     * Unique hashed id of user in a given addin session.
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinSessionUserId: string;

    /**
     * Unique hashed id of the meeting in which addins is created
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    sessionId: string;

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
     * Valid origin to accept post messages from 
     * 
     * @type {string}
     * @memberof InitAddinMessage
     */
    origin: string;

    /**
     * Language used in the hosting application.
     * 
     * @type {string}
     * @memberof InitAddinMessage
     */
    language: string;

    /**
     * Configuration for Skype Signaling Service
     * 
     * @type {HubConfiguration}
     * @memberof InitAddinMessage
     */
    hubconfiguration: HubConfiguration;

    /**
     * Correlation id - can be used for tracking issues.
     * 
     * @type {string}
     * @memberof InitAddinMessage
     */
    correlationId: string;

    /**
     * Can be used in telemetry events to track user's issues.
     * 
     * @type {string}
     * @memberof InitAddinMessage
     */
    telemetrySessionId: string;
}

export interface HubConfiguration {
    /**
     * Maximum number of messages that can be sent in one batched message.
     * 
     * @type {number}
     * @memberof HubConfiguration
     */
    maximumMessages: number;

    /**
     * Maximum size in bytes of the batached message.
     * 
     * @type {number}
     * @memberof HubConfiguration
     */
    maximumSize: number;

    /**
     * How often the messages are sent to Skype Signaling Service.
     * 
     * @type {number}
     * @memberof HubConfiguration
     */
    messageSendRate: number;

    /**
     * Maximum number of conection re-tries.
     * 
     * @type {number}
     * @memberof HubConfiguration
     */
    maximumConnectionAttempmts: number;

    /**
     * Delay between connection re-tries.
     * 
     * @type {number}
     * @memberof HubConfiguration
     */
    connectionRetryDelay: number;

    /**
     * Url of the addins api host
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinApiHost: string;
}
