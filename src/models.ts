// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface ConfigurationItem {
    name: string;
    question: string;
    answerType: PredefinedAnswerType;
    answerOptions: string;
    required: boolean;
    defaultValue: string;
}

export enum PredefinedAnswerType {
    Undefined = 0,
    Text = 1,
    Boolean = 2,
    Option = 3
}

export enum ConnectionState {
    Undefined = 0,
    Connecting = 1,
    Connected = 2,
    Disconnected = 3
}

export interface InitMessageData {
    configuration: ConfigurationItem[];
}

export interface ConfigurationValue {
    name: string;
    value: string;
}

export interface Message {
    type: string;
    time?: number;
    payload?: string;
}

export class BatchMessage {
    public serverTimeStamp?: number;
    public data: Message[];

    constructor() {
        this.data = [];
    }
}

export interface AddinHostMessage {
    type: string;
    payload?: string;
}

export interface TelemetryPayload {
    name: string;
    data: TelemetryPayloadValue[];
}

export interface TelemetryPayloadValue {
    name: string;
    value: string;
}

export const AddinEvents = {
    addinReady: 'skype-sync-addinReady',
    init: 'skype-sync-init',
    auth: 'skype-sync-auth',
    telemetry: 'skype-sync-telemetry',
    unlock: 'skype-sync-unlock'
};

export enum ErrorCodes {
    /**
     * Error thrown when the connect function is called before the Skype Sync is initialized.
     */
    NotInitialized = 1,

    /**
     * Error thrown when there is some error thrown during the connection to Skype Signaling Service.
     */
    ConnectionFailed = 2,

    /**
     * Error thrown if persist content fails.
     */
    PersistContentStoreFailed = 3,

    /**
     * Error thrown if fetching the persist content fails.
     */
    PersistContentFetchFailed = 4,

    /**
     * Error thrown when the message size limit is exceeded.
     */
    MessagesSizeLimitExceeded = 5,

    /**
     * Error thrown when the message rate limit is exceeded.
     */
    MessageRateLimitExceeded = 6,

    /**
     * Error thrown when there is any issue while sending the message to Skype Signaling Service.
     */
    MessageSentFailed = 7
}

/**
 * Initialization
 * 
 * @export
 * @interface InitContext
 * @extends {CoreInitContext}
 */
export interface InitContext extends CoreInitContext {
    
    /**
     * Unique addin session shared by all the users.
     * 
     * @type {string}
     * @memberof DevInitContext
     */
    addinSessionId: string;

    /**
     * Unique has of a user identifier he has in a given addin session.
     * 
     * @type {string}
     * @memberof InitContext
     */
    addinSessionUserId: string;
    
    /**
     * Interview session under which addins are executing.
     * 
     * @type {string}
     * @memberof InitContext
     */
    sessionId: string;
    
    /**
     * Authorization token which is sent to the addin API 
     * 
     * @type {string}
     * @memberof InitContext
     */
    token: string;

    /**
     * User's language used in the session.
     * 
     * @type {string}
     * @memberof InitContext
     */
    language: string;

    /**
     * Correlation id - can be used for tracking issues.
     * 
     * @type {string}
     * @memberof InitContext
     */
    correlationId: string;

    /**
     * Can be used in telemetry events to track user's issues.
     * 
     * @type {string}
     * @memberof InitContext
     */
    telemetrySessionId: string;
}

/**
 * Initialization context with the basic attributes which 
 * is sufficient for local development of the addins.
 * 
 * @export
 * @interface CoreInitContext
 */
export interface CoreInitContext {

    /**
     * Url of the server to be used for addin user context synchronization  (optional)
     * 
     * @type {string}
     * @memberof DevInitContext
     */
    apiHost?: string;
    
    /**
     * Origin of the frame which post messages will be processed.
     * 
     * @type {string}
     * @memberof DevInitContext
     */
    origin?: string;
    
    /**
     * An array of addin configuration values (optional)
     * 
     * @type {ConfigurationValue[]}
     * @memberof DevInitContext
     */
    configuration?: ConfigurationValue[];
}
