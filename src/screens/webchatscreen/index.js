import React, { useEffect, useState } from "react";
import { View, Text } from 'react-native'
// import * as FlexWebChat from "@twilio/flex-webchat-ui";
import { Congif } from './AppConfig'

export default function WebChat({ navigation }) {

    const [manager, setManager] = useState("")
    const [error, setError] = useState("")
    const channelSid = Congif.accountSid;

    // useEffect(() => {
    //     FlexWebChat.Manager.create(Congif)
    //         .then(manager_ => setManager(manager_))
    //         .catch(error_ => setError(error_));
    // }, [])

    // if (manager) {
    //     return (
    //         <FlexWebChat.ContextProvider manager={manager}>
    //             <FlexWebChat.RootContainer />
    //         </FlexWebChat.ContextProvider>
    //     );
    // }

    // if (error) {
    //     console.error("Failed to initialize Flex Web Chat", error);
    // }

    // return null;

    return (
        <View style={{ height: "100%", width: "100%", padding: 20 }}>
            <Text>Web Chat screen</Text>
        </View>
    )
}

