// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Message } from './../models';
import { AddinsHub } from '../interfaces';

export class NullHub implements AddinsHub {

    public connect(url: string): Promise<void> {
        console.log('[SkypeSync][NullHub]:connect', url);
        return Promise.resolve();
    }    
    
    public sendMessage(message: Message): Promise<void> {
        console.log('[SkypeSync][NullHub]:sendMessage', message);
        return Promise.resolve();
    }
    
    public storeContext(context: string): Promise<void> {
        console.log('[SkypeSync][NullHub]:storeContext', context);
        return Promise.resolve();
    }
    
    public fetchContext(): Promise<string> {
        console.log('[SkypeSync][NullHub]:fetchContext');
        return Promise.resolve(null);
    }


}