import React, { useState, useContext, createContext } from 'react';

const defaultInitialState = { channels: [], updateChannels: () => { } };

const AppContext = createContext(defaultInitialState);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [channels, setChannels] = useState([]);
  const [user_name, setUser_name] = useState("");


  return <AppContext.Provider value={{ channels, updateChannels: setChannels, user_name, setUser_name }}>{children}</AppContext.Provider>;
}
