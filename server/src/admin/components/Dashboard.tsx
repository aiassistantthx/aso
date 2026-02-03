import React from 'react';
import { Box, H2, Text } from '@adminjs/design-system';

const Dashboard: React.FC = () => {
  return (
    <Box variant="grey">
      <Box variant="white" p="xl">
        <H2>LocalizeShots Admin</H2>
        <Text mt="default">
          Welcome to the admin panel. Use the sidebar to manage users, subscriptions, projects, and prompts.
        </Text>
      </Box>
    </Box>
  );
};

export default Dashboard;
