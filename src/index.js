// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class SharedCanvasSDK {

  constructor() {
    window.addEventListener("message", this.handleMessages);
  }

  initHandler;
  receiveHandler;
  persistedContentHandler;

  handleMessages = (window, messageEvent) => {
    const data = JSON.parse(messageEvent.data);
    switch (data.type) {
      case "__SKYPE__LOAD_PERSISTED_CONTENT":
        persistedContentHandler(data.content);
        return;
      case "__SKYPE__INIT":
        initHandler(data.content);
        return;
      default:
        receiveHandler(type, data.content);
        return;
    }
  }

  init = (handler) => {
    initHandler = handler;
  }

  send = (type, content) => {
    parent.postMessage(
      JSON.stringify({
        type: type,
        content: content
      }),
      "*"
    );
  }

  onReceive = (handler) => {
    receiveHandler = handler;
  }

  persistContent = (content) => {
    send("__SKYPE__PERSIST_CONTENT", content);
  }

  loadPersistedContent = (handler) => {
    persistedContentHandler = handler;
  }
}

const sharedCanvasSDK = new SharedCanvasSDK();
export default sharedCanvasSDK;
