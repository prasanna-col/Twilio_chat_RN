import React, { useState, useLayoutEffect, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { Client } from 'twilio-chat';
import { colors } from '../../theme';
import { routes } from '../../app';
import { TwilioService } from '../../services/twilio-service';
import { getToken } from '../../services/api-service';
import { useApp } from '../../app-context';

import { ChatListLoader } from './components/chat-list-loader';
import { ChatListEmpty } from './components/chat-list-empty';
import { ChatListItem } from './components/chat-list-item';
import { useIsFocused } from '@react-navigation/native';

export function ChatListScreen({ navigation, route }) {
  const { setUser_name, user_name } = useApp();
  // const { username } = route.params;
  const username = user_name
  const [loading, setLoading] = useState(true);
  const { channels, updateChannels } = useApp();
  const channelPaginator = useRef();
  const isFocused = useIsFocused();

  const [client, setClient] = useState(null);
  const [pub_channels, setPub_Channels] = useState([]);
  const [Own_channels, setOwn_Channels] = useState([]);
  const [Joined_channels, setJoined_Channels] = useState([]);
  const [AccessChannels, setAccessChannels] = useState([])

  // const client_ = new Client(accountSid, apiKey, apiSecret);
  // // Get a reference to the chat service
  // const chatService = client_.services(process.env.TWILIO_CHAT_SERVICE_SID);

  useEffect(() => {
    // Get all channels once the client is initialized
    if (client) {
      client.getPublicChannelDescriptors().then(async channelDescriptors => {
        const channelPromises = await channelDescriptors?.state?.items.map(descriptor => descriptor.getChannel());
        await Promise.all(channelPromises).then(async publicChannels => {
          console.log("all_pub_channels", publicChannels)
          setPub_Channels(publicChannels);

          // get createdByUserChannels
          var createdByUserChannels = await publicChannels.filter(channel => channel.channelState.createdBy === username);
          console.log("createdByUserChannels", createdByUserChannels)
          await setOwn_Channels(createdByUserChannels);

          // get userJoinedChannels
          var userJoinedChannels = await publicChannels.filter(channel => channel.channelState.status == 'joined');
          console.log("userJoinedChannels", userJoinedChannels)
          await setJoined_Channels(userJoinedChannels);

          // get the list of channels able to access (created and joined channels)
          let uniqueObjArray = [
            ...new Map([...createdByUserChannels, ...userJoinedChannels].map((item) => [item["entityName"], item])).values(),
          ];
          setAccessChannels(uniqueObjArray)
          console.log("uniqueObjArray", uniqueObjArray)

        });
        setLoading(false)
      });
      // getUserOwnCannels()
      // getJoinedChannels()
    }

  }, [client, isFocused]);

  const getUserOwnCannels = async () => {
    client.getPublicChannelDescriptors().then(async channelDescriptors => {
      // console.log("channelDescriptors", channelDescriptors)
      const channelPromises = await channelDescriptors?.state?.items.map(descriptor => descriptor.getChannel());
      await Promise.all(channelPromises).then(async publicChannels => {
        var createdByUserChannels = await publicChannels.filter(channel => channel.channelState.createdBy === username);
        console.log("createdByUserChannels", createdByUserChannels)
        await setOwn_Channels(createdByUserChannels);
      });
      // setLoading(false)
    });
  }


  const getJoinedChannels = () => {
    client.getPublicChannelDescriptors().then(async channelDescriptors => {
      // console.log("channelDescriptors", channelDescriptors)
      const channelPromises = await channelDescriptors?.state?.items.map(descriptor => descriptor.getChannel());
      await Promise.all(channelPromises).then(async publicChannels => {
        var userJoinedChannels = await publicChannels.filter(channel => channel.channelState.status == 'joined');
        console.log("userJoinedChannels", userJoinedChannels)
        await setJoined_Channels(userJoinedChannels);
      });
      setLoading(false)
    });

  }


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate(routes.ChatCreat.name)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const setChannelEvents = useCallback(
    (client) => {
      console.log("setChannelEvents")
      client.on('messageAdded', (message) => {
        updateChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.id === message.channel.sid ? { ...channel, lastMessageTime: message.dateCreated } : channel,
          ),
        );
      });
      return client;
    },
    [updateChannels],
  );

  const getSubscribedChannels = useCallback(
    (client) => client.getSubscribedChannels().then((paginator) => {
      channelPaginator.current = paginator;
      const newChannels = TwilioService.getInstance().parseChannels(channelPaginator.current.items);
      updateChannels(newChannels);
    }),
    [updateChannels],
  );

  useEffect(() => {

  }, [])

  useEffect(() => {
    getToken(username)
      .then(async (token) => {
        TwilioService.getInstance().getChatClient(token)
        Client.create(token).then(chatClient => {
          setClient(chatClient);
        });
      })
      // .then(() => { TwilioService.getInstance().addTokenListener(getToken) })
      // .then(setChannelEvents)
      // .then(getSubscribedChannels)
      .catch((err) => {
        console.log("err", err)
        showMessage({ message: err.message, type: 'danger' })
      })
    // .finally(() => setLoading(false));

    return () => TwilioService.getInstance().clientShutdown();
  }, [username, setChannelEvents, getSubscribedChannels]);

  const sortedChannels = useMemo(
    () => channels.sort((channelA, channelB) => channelB.lastMessageTime - channelA.lastMessageTime),
    [channels],
  );

  return (
    <View style={styles.screen}>
      {loading ? (
        <ChatListLoader />
      ) : (
        <>
          <Text style={{ fontWeight: "bold", padding: 10, fontSize: 15, color: colors.windsor }}>Username: {username}</Text>
          <FlatList
            data={AccessChannels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatListItem
                username={username}
                channel={item}
                onPress={() => navigation.navigate(routes.ChatRoom.name, { channelId: item?.sid, identity: username, channelName: item?.channelState?.friendlyName })}
              />
            )}
            ListEmptyComponent={<ChatListEmpty />}
          />
        </>

      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.snow,
  },
  addButton: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    color: colors.white,
  },
});
