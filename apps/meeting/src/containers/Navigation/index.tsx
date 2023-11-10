// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Eye,
  SignalStrength,
  Flex,
  ZoomIn,
  ZoomOut,
  useContentShareState,
  Chat,
  Feedback,
} from 'amazon-chime-sdk-component-library-react';

import { useNavigation } from '../../providers/NavigationProvider';
import { useAppState } from '../../providers/AppStateProvider';
import { LocalMediaStreamMetrics } from '../LocalMediaStreamMetrics';
import { Layout } from '../../types';
import GalleryLayout from '../../components/icons/GalleryLayout';
import FeaturedLayout from '../../components/icons/FeaturedLayout';
import { useVideoTileGridControl } from '../../providers/VideoTileGridProvider';

const Navigation: React.FC = () => {
  const { toggleRoster, closeNavbar, toggleChat, toggleTranscript } = useNavigation();
  const { theme, toggleTheme, layout, setLayout, priorityBasedPolicy, toggleTranscription } = useAppState();
  const { sharingAttendeeId } = useContentShareState();
  const { zoomIn, zoomOut } = useVideoTileGridControl();
  const enableTranscription = async () => {
    toggleTranscription();
    toggleTranscript();
  };
  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="Navigation" onClose={closeNavbar} />
      <Flex css="margin-top: 0rem;">
        <NavbarItem
          icon={<Attendees />}
          onClick={toggleRoster}
          label="Attendees"
        />
        <NavbarItem
          icon={<Chat />}
          onClick={toggleChat}
          label="Chat"
        />
        <NavbarItem
          icon={<Feedback />}
          onClick={enableTranscription}
          label="Transcription"
        />


      </Flex>
      <Flex marginTop="auto">
        <NavbarItem
          icon={
            layout === Layout.Gallery ? (
              <FeaturedLayout />
            ) : (
              <GalleryLayout />
            )
          }
          onClick={(): void => {
            if (layout === Layout.Gallery) {
              setLayout(Layout.Featured);
            } else {
              setLayout(Layout.Gallery);
            }
          }}
          disabled={!!sharingAttendeeId}
          label="Switch View"
        />
        {layout === Layout.Gallery && priorityBasedPolicy &&
          <>
            <NavbarItem
              icon={<ZoomIn />}
              onClick={zoomIn}
              label="Zoom In"
              disabled={!!sharingAttendeeId}
            />
            <NavbarItem
              icon={<ZoomOut />}
              onClick={zoomOut}
              label="Zoom Out"
            />
          </>
        }
        <NavbarItem
          icon={<Eye />}
          onClick={toggleTheme}
          label={theme === 'light' ? 'Dark mode' : 'Light mode'}
        />
        <NavbarItem
          icon={<SignalStrength />}
          onClick={(): void => {
            // do nothing
          }}
          label="Media metrics"
        >
          <LocalMediaStreamMetrics />
        </NavbarItem>
      </Flex>
    </Navbar>
  );
};

export default Navigation;
