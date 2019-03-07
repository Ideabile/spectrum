// @flow
import React, { useEffect } from 'react';
import compose from 'recompose/compose';
import Tooltip from 'src/components/Tooltip';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import { getCurrentUserCommunityConnection } from 'shared/graphql/queries/user/getUserCommunityConnection';
import { AvatarGrid, AvatarLink, Avatar, Shortcut, Label } from './style';

const CommunityList = (props: Props) => {
  const { data, match, history, sidenavIsOpen, setNavigationIsOpen } = props;
  const { user } = data;

  if (!user) return null;

  const { communityConnection } = user;
  const { edges } = communityConnection;
  const communities = edges.map(edge => edge && edge.node);
  const sorted = communities.slice().sort((a, b) => {
    const bc = parseInt(b.communityPermissions.reputation, 10);
    const ac = parseInt(a.communityPermissions.reputation, 10);

    // sort same-reputation communities alphabetically
    if (ac === bc) {
      return a.name.toUpperCase() <= b.name.toUpperCase() ? -1 : 1;
    }

    // otherwise sort by reputation
    return bc <= ac ? -1 : 1;
  });

  useEffect(() => {
    const handleCommunitySwitch = e => {
      const ONE = 49;
      const TWO = 50;
      const THREE = 51;
      const FOUR = 52;
      const FIVE = 53;
      const SIX = 54;
      const SEVEN = 55;
      const EIGHT = 56;
      const NINE = 57;

      const possibleKeys = [
        ONE,
        TWO,
        THREE,
        FOUR,
        FIVE,
        SIX,
        SEVEN,
        EIGHT,
        NINE,
      ];

      if (e.altKey) {
        const index = possibleKeys.indexOf(e.keyCode);
        if (index >= 0) {
          const community = sorted[index];
          if (!community) return;
          setNavigationIsOpen(false);
          return history.push(`/${community.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleCommunitySwitch, false);
    return () =>
      window.removeEventListener('keydown', handleCommunitySwitch, false);
  }, []);

  return sorted.map((community, index) => {
    if (!community) return null;

    const { communityPermissions } = community;
    const { isMember, isBlocked } = communityPermissions;
    if (!isMember || isBlocked) return null;

    const isActive = community.slug === match.params.communitySlug;

    return (
      <Tooltip title={community.name} key={community.id}>
        <AvatarGrid isActive={isActive}>
          <AvatarLink
            to={`/${community.slug}`}
            onClick={() => setNavigationIsOpen(false)}
          >
            <Avatar
              isActive={isActive}
              src={community.profilePhoto}
              size={sidenavIsOpen ? 32 : 36}
            />

            <Label isActive={isActive}>{community.name}</Label>
          </AvatarLink>
          {index < 9 && <Shortcut>⌥{index + 1}</Shortcut>}
        </AvatarGrid>
      </Tooltip>
    );
  });
};
export default compose(
  getCurrentUserCommunityConnection,
  viewNetworkHandler
)(CommunityList);