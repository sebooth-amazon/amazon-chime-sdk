// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import MeetingRoster from '../MeetingRoster';
import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import Chat from '../Chat';
import { Flex } from 'amazon-chime-sdk-component-library-react';
import Transcript from '../TranscriptHistory';

const NavigationControl = () => {
  const { showNavbar, showRoster, showChat, showTranscript } = useNavigation();

  const view = () => {
    return (
      <Flex layout="stack" style={{ height: '100vh' }}>
        {showRoster ? <MeetingRoster /> : null}
        {showChat ? <Chat /> : null}
        {showTranscript ? <Transcript /> : null}
      </Flex>
    );
  };

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {view()}
    </>
  );
};

export default NavigationControl;
