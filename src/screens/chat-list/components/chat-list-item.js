import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

import { colors } from '../../../theme';
import { images } from '../../../assets';

export function ChatListItem({ username, channel, onPress }) {

  var name = channel.channelState.createdBy == username ? username : ""

  console.log("username", username)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image style={styles.cardIcon} source={images.message} />
      <Text style={styles.cardText}>{channel?.channelState?.friendlyName}{name ? (" - (created)") : "  - (Joined)"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.windsor,
    backgroundColor: colors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardIcon: {
    height: 44,
    width: 44,
  },
  cardText: {
    fontSize: 16,
    color: colors.cinder,
    marginLeft: 24,
    marginRight: 8,
  },
  cardText2: {
    fontSize: 14,
    color: colors.cinder,
    marginLeft: 24,
    marginRight: 8,
  },
});
