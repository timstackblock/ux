import React, { useState, useEffect } from 'react';
import { Identity } from '@stacks/keychain';
import { Text, Flex, FlexProps, Spinner } from '@blockstack/ui';
import { ScreenPaths, DEFAULT_PASSWORD } from '@store/onboarding/types';
import { PlusInCircle } from '@components/icons/plus-in-circle';
import { ListItem } from './list-item';
import { AccountAvatar } from './account-avatar';
import { useAnalytics } from '@common/hooks/use-analytics';
import { useWallet } from '@common/hooks/use-wallet';
import { useDispatch } from '@common/hooks/use-dispatch';
import { didGenerateWallet } from '@store/wallet/actions';
import { USERNAMES_ENABLED } from '@common/constants';

const loadingProps = { color: '#A1A7B3' };
const getLoadingProps = (loading: boolean) => (loading ? loadingProps : {});

interface AccountItemProps extends FlexProps {
  label: string;
  iconComponent?: (props: { hover: boolean }) => void;
  isFirst?: boolean;
  hasAction?: boolean;
  onClick?: () => void;
  address?: string;
  selectedAddress?: string | null;
  loading?: boolean;
}

const AccountItem = ({ label, address, selectedAddress, ...rest }: AccountItemProps) => {
  const loading = address === selectedAddress;
  return (
    <Flex alignItems="center" maxWidth="100%" {...rest}>
      <Flex flex={1} maxWidth="100%">
        <Text
          display="block"
          maxWidth="100%"
          textAlign="left"
          textStyle="body.small.medium"
          style={{ wordBreak: 'break-word' }}
          {...getLoadingProps(!!selectedAddress)}
        >
          {label.replace(/\.id\.blockstack$/, '')}
        </Text>
      </Flex>
      <Flex width={4} flexDirection="column" mr={3}>
        {loading && <Spinner width={4} height={4} {...loadingProps} />}
      </Flex>
    </Flex>
  );
};

interface AccountsProps {
  identities: Identity[];
  identityIndex?: number;
  showAddAccount?: boolean;
  next?: (identityIndex: number) => void;
}

export const Accounts = ({ identities, showAddAccount, identityIndex, next }: AccountsProps) => {
  const [selectedAddress, setSelectedAddress] = useState<null | string>(null);
  const { wallet } = useWallet();
  const { doChangeScreen } = useAnalytics();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof identityIndex === 'undefined' && selectedAddress) {
      setSelectedAddress(null);
    }
  }, [identityIndex]);

  return (
    <Flex flexDirection="column">
      {identities.map(({ defaultUsername, address }, key) => {
        return (
          <ListItem
            key={key}
            isFirst={key === 0}
            cursor={selectedAddress ? 'not-allowed' : 'pointer'}
            iconComponent={() => <AccountAvatar username={defaultUsername || address} mr={3} />}
            hasAction={!!next && selectedAddress === null}
            onClick={() => {
              if (!next) return;
              if (selectedAddress) return;
              setSelectedAddress(address);
              next(key);
            }}
          >
            <AccountItem
              address={address}
              selectedAddress={selectedAddress}
              label={defaultUsername || address}
              data-test={`account-index-${key}`}
            />
          </ListItem>
        );
      })}
      {showAddAccount && (
        <ListItem
          onClick={async () => {
            if (selectedAddress || !wallet || !next) return;
            if (USERNAMES_ENABLED) {
              doChangeScreen(ScreenPaths.ADD_ACCOUNT);
              return;
            }
            setSelectedAddress('new');
            await wallet.createNewIdentity(DEFAULT_PASSWORD);
            identityIndex = wallet.identities.length - 1;
            await dispatch(didGenerateWallet(wallet));
            next(identityIndex);
          }}
          cursor={selectedAddress ? 'not-allowed' : 'pointer'}
          hasAction
          iconComponent={() => (
            <Flex
              justify="center"
              width="36px"
              mr={3}
              color="ink.300"
              transition="0.08s all ease-in-out"
            >
              <PlusInCircle />
            </Flex>
          )}
        >
          <Text textStyle="body.small.medium" {...getLoadingProps(!!selectedAddress)}>
            Add a new account
          </Text>
        </ListItem>
      )}
    </Flex>
  );
};
