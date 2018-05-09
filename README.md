# Skype Sync SDK

Skype Sync allows you create shared experiences across different Skype Interviews instances.

## Getting started

Let's assume we are building a simplified synchronized note pad app.

1. Import the Sync SDK
```js
import Sync from 'skype-sync'
```

2. Make sure to setup initialization handlers to accomondate for your UI.
```js
Sync.init((configuration) => {
  // initialize your application with given configuration
})
```

## Broadcast actions

When our notepad wants to send out new actions to the other instances, the app just calls `send(type, payload)` to broadcast its information. 

```js
Sync.send('ADD_NOTE', {
  message: textInput.value,
  author: this.state.author
})
```

## Receive actions

To handle incoming messages the app needs to pass an event handler to the `onReceive((type, payload) => any)` function.

When our notepad receives a new action, we can do a switch case on the action type. Then we divert it to the correct function to handle the payload of the action.

```js
Sync.onReceive((type, payload) => {
  switch (type) {
    case 'ADD_NOTE':
      // handle adding new note
      addNote(payload)
      break
    case 'DELETE_NOTE':
      // handle deleting a note
      deleteNote(payload)
      break
    default:
      return
  }
})
```

## Persist content

Skype Interviews offers long-term storage for your content to have it persist across multiple sessions. Users who close their browser and come back to the session in a few days will be able to pick up the session from where they left off.

### Persist your content across sessions
Put in any javascript object and we're going to persist it for this session.
```js
Sync.persistContent(notes)
```

### Load persisted content
To retrieve the persisted content, set up a handler. Then call the `loadPersistedContent()` method to initiate a request to fetch the stored content.
```js
Sync.onPersistedContentLoaded((content) => {
  app.state.notes = content
})
Sync.loadPersistedContent()
```



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
