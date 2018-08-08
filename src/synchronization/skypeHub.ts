// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import signalr = require('@aspnet/signalr');
import msgPack = require('@aspnet/signalr-protocol-msgpack');

import configuration from '../configuration';
import { AddinsHub, SkypeSync } from '../interfaces';
import { BatchMessage, ConnectionState } from '../models';
import receivingService from '../services/receivingService';
import HubDisconnectedEvent from '../services/telemetry/hubDisconnectedEvent';
import telemetryService from '../services/telemetryService';

/**
 * Addins hub is a socket server endpoint supporting the addins messaging needs
 * enabling generic infrastructure for addin context synchronization between addin session users
 * 
 * @export
 * @class AddinsHub
 */
export class SkypeHub implements AddinsHub {

    private hub: signalr.HubConnection;
    private currentConnectionAttempt = 0;
    private isReconnecting = false;

    constructor(private syncSdk: SkypeSync) {
        receivingService.init(syncSdk);
    }

    /**
     * Initialize the connection with the socket server endpoint 
     * located on a given endpoint
     * 
     * @param {string} url 
     * @param {string} token
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    public connect(url: string, token: string): Promise<void> {
        this.syncSdk.connectionHandler(ConnectionState.Connecting);
        this.hub = new signalr.HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: () => token })
            .withHubProtocol(new msgPack.MessagePackHubProtocol())
            .configureLogging(signalr.LogLevel.Error)
            .build();

        this.hub.on('messageReceived', (message: BatchMessage) => {
            console.log('[[SkypeSync][AddinsHub]:onMessageReceived]', message);
            receivingService.messageReceived(message);
        });

        this.hub.on('forceReconnect', (hubHost: string) => {
            console.log('[[SkypeSync][AddinsHub]:forceReconnect]', hubHost);
            this.connect(hubHost, token);
        });

        this.hub.onclose((error) => {
            this.syncSdk.connectionHandler(ConnectionState.Disconnected);
            const disconnectedEvent = new HubDisconnectedEvent();
            if (error) {
                disconnectedEvent.data.push({ name: 'error', value: JSON.stringify(error) });
            }
            telemetryService.sendTelemetryData(disconnectedEvent);

            if (this.isReconnecting) {
                return;
            }

            this.isReconnecting = true;
            return new Promise<void>((resolve, reject) => {
                this.tryConnect(resolve, reject);
            });
        });

        console.log('[SkypeSync][AddinsHub]::connect - hub:', url);

        return new Promise<void>((resolve, reject) => {
            this.tryConnect(resolve, reject);
        });
    }

    /**
     * Sends a message to the hub to the other users participating in the same addin session.
     * 
     * @param {Message} message 
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    public sendMessage(message: BatchMessage): Promise<void> {
        console.log('[SkypeSync][AddinsHub]::sendMessage', message);
        return this.hub.invoke('sendMessage', message);
    }

    /**
     * Sends a command to the hub to persist given addin session context for later use
     * 
     * @param {StoreContext} context 
     * @returns {Promise<void>} 
     * @memberof AddinsHub
     */
    public storeContext(context: string): Promise<void> {
        console.log('[SkypeSync][AddinsHub]::storeContext', context);
        return this.hub.invoke('storeContext', context);
    }

    /**
     * Retrieve previously persisted context from the hub.
     * 
     * @returns {Promise<string>} Previously persisted context (if any)
     * @memberof AddinsHub
     */
    public fetchContext(): Promise<string> {
        console.log('[SkypeSync][AddinsHub]::fetchContext');
        return this.hub.invoke('fetchContext');
    }

    private tryConnect = (resolve, reject) => {
        this.hub.start()
            .then(() => {
                this.syncSdk.connectionHandler(ConnectionState.Connected);
                this.currentConnectionAttempt = 0;
                this.isReconnecting = false;
                resolve();
            })
            .catch(() => {
                if (this.currentConnectionAttempt++ >= configuration.maximumConnectionAttempmts) {
                    reject();
                } else {
                    setTimeout(() => {
                        this.tryConnect(resolve, reject);
                    }, configuration.connectionRetryDelay);
                }
            });
    }
}
