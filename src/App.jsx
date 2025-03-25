import React from 'react';
import { MantineProvider } from '@mantine/core';
import DiscordTextFormatter from './Components/DiscordTextFormatter';

function App() {
  return (
    <MantineProvider>
      <DiscordTextFormatter />
    </MantineProvider>
  );
}

export default App;