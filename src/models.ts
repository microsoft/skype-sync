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
    configuration: Array<ConfigurationItem>;
}

export interface ConfigurationValue {
    name: string;
    value: string;
}

export interface Message {
    type: string;
    payload?: string;
}

export interface AddinReadyMessage {
    type: string;
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
    
    /**
     * An array of addin setting values (optional
     * 
     * @type {ConfigurationValue[]}
     * @memberof DevInitContext
     */
    settings?: ConfigurationValue[];
}
