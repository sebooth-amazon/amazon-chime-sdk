// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Flex,
  Heading,
} from 'amazon-chime-sdk-component-library-react';

import { useAppState } from '../../providers/AppStateProvider';
import { StyledList } from './Styled';
import { MeetingMode } from '../../types';

const MeetingDetails = () => {
  const { meetingId, meetingTitle, region, meetingMode } = useAppState();

  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: '2rem' }} px="1rem">
        <Heading level={4} tag="h1" mb={2}>
          {meetingTitle ? meetingTitle : 'Meeting information'}
        </Heading>
        <StyledList>
          <div>
            <dt>Meeting ID</dt>
            <dd>{meetingId}</dd>
          </div>
          <div>
            <dt>Hosted region</dt>
            <dd>{region}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{MeetingMode[meetingMode]}</dd>
          </div>
        </StyledList>
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
