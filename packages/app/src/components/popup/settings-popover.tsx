import React, { useCallback } from 'react';
import { Box, Text, BoxProps, Flex } from '@stacks/ui';
import useOnClickOutside from 'use-onclickoutside';
import { useWallet } from '@common/hooks/use-wallet';
import { useAnalytics } from '@common/hooks/use-analytics';
import { ScreenPaths } from '@store/onboarding/types';
import { Divider } from '@components/divider';

const SettingsItem: React.FC<BoxProps> = ({ onClick, children, ...props }) => (
  <Box
    {...props}
    width="100%"
    p="base-tight"
    display="block"
    color="ink.1000"
    _hover={{ backgroundColor: 'ink.150' }}
    onClick={e => {
      onClick?.(e);
    }}
  >
    <Text textStyle="body.small">{children}</Text>
  </Box>
);

interface SettingsPopoverProps {
  showing: boolean;
  close: () => void;
  showSwitchAccount: () => void;
  showNetworks: () => void;
  showAddUsername: () => void;
  showCreateAccount: () => void;
}
export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  showing,
  close,
  showSwitchAccount,
  showNetworks,
  showAddUsername,
  showCreateAccount,
}) => {
  const ref = React.useRef(null);
  const { doSignOut, currentIdentity, doLockWallet, identities, currentNetworkKey } = useWallet();
  const { doChangeScreen } = useAnalytics();

  useOnClickOutside(ref, () => {
    if (showing) {
      close();
    }
  });

  const clicked = useCallback(
    cb => {
      return () => {
        close();
        cb();
      };
    },
    [close]
  );

  return (
    <Box
      ref={ref}
      position="absolute"
      top="14px"
      right="0px"
      borderRadius="8px"
      width="296px"
      boxShadow="0px 8px 16px rgba(27, 39, 51, 0.08);"
      zIndex={2000}
      background="white"
      display={showing ? 'block' : 'none'}
    >
      <SettingsItem mt="tight" onClick={clicked(showSwitchAccount)}>
        Switch account
      </SettingsItem>
      {identities && identities.length > 1 ? (
        <SettingsItem onClick={clicked(showCreateAccount)}>Create an Account</SettingsItem>
      ) : null}
      {/* <SettingsItem
        onClick={() => {
          const url = chrome.runtime.getURL(ScreenPaths.SETTINGS_KEY);
          window.open(url, '_blank');
        }}
      >
        View Secret Key
      </SettingsItem> */}
      {currentIdentity && !currentIdentity.defaultUsername ? (
        <>
          <Divider />
          <SettingsItem onClick={clicked(showAddUsername)}>Add username</SettingsItem>
        </>
      ) : null}
      <Divider />
      <SettingsItem mb="tight" onClick={clicked(showNetworks)}>
        <Flex width="100%">
          <Box flexGrow={1}>Change Network</Box>
          <Box color="ink.600">{currentNetworkKey}</Box>
        </Flex>
      </SettingsItem>
      <Divider />
      <SettingsItem
        mb="tight"
        onClick={() => {
          doSignOut();
          doChangeScreen(ScreenPaths.INSTALLED);
        }}
      >
        Sign Out
      </SettingsItem>
      <SettingsItem
        mb="tight"
        onClick={() => {
          doChangeScreen(ScreenPaths.POPUP_HOME);
          doLockWallet();
        }}
      >
        Lock
      </SettingsItem>
    </Box>
  );
};
