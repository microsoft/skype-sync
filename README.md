# Skype Sync SDK

Skype Sync allows you to create shared experiences across different Skype Interviews instances. You can use Skype Sync to synchronize experience between sessions.

## Getting started

Let's assume we are building a simplified synchronized note pad app.

1. Install skype-sync npm package.

```
npm install skype-sync
```

2. Import the Sync SDK

```ts
import Sync, { InitContext } from 'skype-sync';
```

3. Make sure to setup initialization handlers to accomodate for your UI. It will be called when Skype Sync is ready to be used and it will contain Initialization Context.

```ts
Sync.initHandler = (context: InitContext) => {
  // implement your application start-up logic        
}
```

## Addin initialization context
In order for your addin to perform well in a given interview you may need a few data informing you about what interview you are part of, what user is loading the interview etc. We are providing you this data in a way which both protects privacy of our users and allows your addin to work normally.
 
We will be sending you next contextual values when your addin loads in the interview:

- `sessionId` - this is hashed value of a specific interview which you can use if you have more then one addin loaded to synchornize their activities
- `sessionAddIn` - this is hashed value of a interview addin session which is used for routing messages only to other users using that addin in a given interview
- `sessionUserId` - this is hashed value of a user in a given interview addin and you can use it to distinguish which one of the users loaded addin and performing actions in it (eg. Mike Smith is typing...)

```ts
// Unique addin session shared by all the users.
addinSessionId: string;

// Unique hash of a user identifier he/she has in a given addin session.
addinSessionUserId: string;

// Interview session under which addins are executing.
sessionId: string;

// Authorization token which is sent to the addin API.
token: string;

// User's language used in the session.
language: string;

// An array of addin configuration values (optional).
configuration?: ConfigurationValue[];
```

## Broadcast actions

When our notepad wants to send out new actions to the other participants, the app needs to explicitly connect to the signaling service. 

```ts
Sync.connect().then(() => {
  // you are now connected and you can send messages
});
```

After that your application can just call `Sync.sendMessage(type: string, payload?: any);` to broadcast its information. 
- `type` can be any string, identifying the type of your message in the application, so in our case of notepad it can be 'ADD_NOTE'.
- `payload` is optional parameter and can be any payload that is sent to the other participants that are sharing same `addinSessionId` (~all participants using same addin in same interview session).

```js
Sync.sendMessage('ADD_NOTE', {
  note: textInput.value
});
```

### Handling connection

Skype Sync implements linear re-try connection policy. In case it is not able to connect to Skype Signaling Service it automatically retries in 500ms. It will try to connect 5 times. Only when after all attempts the error is reported via `errorHandler`.

Same rules are applied when connection is lost. Skype Sync will retry to reconnect 5 times, every 500ms. In this case Connection State is updated immediately via `connectionHandler`.

### NOTE
There are certain limits on how many messages can be sent in time and what can be overall size of the messages:
- only 50 messages can be sent every 200ms
- total amount of data that can be sent every 200ms cannot be more than 128Kb

In case that the limit is exceeded and next message is sent we are informing application using the `errorHandler` (please see below);

## Receive actions

To handle incoming messages the app needs to register the message handler.

```ts
import Sync, { Message } from 'skype-sync';

Sync.messageHandler = (message: Message) => {
  switch(message.type) {
    case 'ADD_NOTE':
      // handle adding new note
      addNote(message.payload);
      break;
    case 'DELETE_NOTE':
      // handle deleting a note
      deleteNote(message.payload);
      break;
    default:
      return;
  }
}
```

## Error handling

### General error handling

In order to handle errors that can happen during synchronization or when the message limit is reached, the app can set an error handler:

```ts
import Sync, { ErrorCodes } from 'skype-sync';

Sync.errorHandler = (errorCode: ErrorCodes, e?: any) => {
  // handle Skype Sync error
}
```

Skype Sync provides the error code for given issue that occured in the Skype Sync.
- `NotInitialized` - Error thrown when the connect function is called before the Skype Sync is initialized.
- `ConnectionFailed` - Error thrown when there is some error thrown during the connection to Skype Signaling Service.
- `PersistContentStoreFailed` - Error thrown if persist content fails.
- `PersistContentFetchFailed` - Error thrown if fetching the persist content fails.
- `MessagesSizeLimitExceeded` - Error thrown when the message size limit is exceeded.
- `MessageRateLimitExceeded` - Error thrown when the message rate limit is exceeded.
- `MessageSentFailed` - Error thrown when there is any issue while sending the message to Skype Signaling Service.

### Skype Signaling Service connection states

Application can also be subscribed to changes of the Signaling service connection state. Please note that Skype Sync can send messages only when the connection state is `Connected`.

```ts
Sync.connectionHandler = (newState: ConnectionState) => {
  // handle connection state
}
```

Connection state can be one of those values:
- `Undefined` - Unknown state, typically when Skype Sync is not initialized
- `Connecting` - Application is connecting to the Signaling service
- `Connected` - Application is connected to the Signaling service
- `Disconnected` - Application is not connected to the Signaling service

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
