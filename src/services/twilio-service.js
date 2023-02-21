import { Client, ChatManager } from 'twilio-chat';

export class TwilioService {
  static serviceInstance;
  static chatClient;

  constructor() { }

  static getInstance() {
    if (!TwilioService.serviceInstance) {
      TwilioService.serviceInstance = new TwilioService();
    }
    return TwilioService.serviceInstance;
  }

  async getChatClient(twilioToken) {
    console.log("twilioToken", twilioToken)
    if ((!TwilioService.chatClient) && (!twilioToken)) {
      throw new Error('getChatClient: Twilio token is null or undefined');
    }
    if (!TwilioService.chatClient && twilioToken) {

      return Client.create(twilioToken).then(async (client) => {
        TwilioService.chatClient = await client;
        // console.log("TwilioService.chatClient", client)
        return TwilioService.chatClient;
      });

      // TwilioService.chatClient = ChatManager.create(twilioToken)
      // console.log("TwilioService.chatClient", TwilioService.chatClient)
      // return TwilioService.chatClient
    }
    return Promise.resolve().then(() => TwilioService.chatClient);
  }

  clientShutdown() {
    TwilioService.chatClient?.shutdown();
    TwilioService.chatClient = null;
  }

  addTokenListener(getToken) {
    if (!TwilioService.chatClient) {
      throw new Error('addTokenListener: Twilio client is null or undefined');
    }
    TwilioService.chatClient.on('tokenAboutToExpire', () => {
      getToken().then(TwilioService.chatClient.updateToken);
    });

    TwilioService.chatClient.on('tokenExpired', () => {
      getToken().then(TwilioService.chatClient.updateToken);
    });
    return TwilioService.chatClient;
  }

  parseChannels(channels) {
    return channels.map(this.parseChannel);
  }

  parseChannel(channel) {
    return {
      id: channel.sid,
      name: channel.friendlyName,
      createdAt: channel.dateCreated,
      updatedAt: channel.dateUpdated,
      lastMessageTime: channel.lastMessage?.dateCreated ?? channel.dateUpdated ?? channel.dateCreated,
    };
  }

  parseMessages(messages) {
    return messages.map(this.parseMessage).reverse();
  }

  parseMessage(message) {
    return {
      _id: message.sid,
      text: message.body,
      createdAt: message.dateCreated,
      user: {
        _id: message.author,
        name: message.author,
      },
      received: true,
    };
  }
}
