// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode, useEffect } from 'react';
import { VideoPriorityBasedPolicy } from 'amazon-chime-sdk-js';
import { MeetingMode, Layout, VideoFiltersCpuUtilization } from '../types';
import { JoinMeetingInfo } from '../utils/api';
import { useLogger } from 'amazon-chime-sdk-component-library-react';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  meetingTitle: string;
  urlParametersProvided: boolean;
  localUserName: string;
  theme: string;
  region: string;
  isWebAudioEnabled: boolean;
  isTranscriptionEnabled: boolean;
  videoTransformCpuUtilization: string;
  imageBlob: Blob | undefined;
  isEchoReductionEnabled: boolean;
  meetingMode: MeetingMode;
  enableSimulcast: boolean;
  priorityBasedPolicy: VideoPriorityBasedPolicy | undefined;
  keepLastFrameWhenPaused: boolean;
  layout: Layout;
  joinInfo: JoinMeetingInfo | undefined;
  toggleTheme: () => void;
  toggleTranscription: () => void;
  toggleWebAudio: () => void;
  toggleSimulcast: () => void;
  togglePriorityBasedPolicy: () => void;
  toggleKeepLastFrameWhenPaused: () => void;
  setCpuUtilization: (videoTransformCpuUtilization: string) => void;
  toggleEchoReduction: () => void;
  setMeetingMode: React.Dispatch<React.SetStateAction<MeetingMode>>;
  setJoinInfo: (joinInfo: JoinMeetingInfo | undefined) => void;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  setMeetingId: React.Dispatch<React.SetStateAction<string>>;
  setMeetingTitle: React.Dispatch<React.SetStateAction<string>>;
  setLocalUserName: React.Dispatch<React.SetStateAction<string>>;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  setBlob: (imageBlob: Blob) => void;
  skipDeviceSelection: boolean;
  toggleMeetingJoinDeviceSelection: () => void;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}

const query = new URLSearchParams(location.search);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AppStateProvider({ children }: Props) {
  const logger = useLogger();
  const [urlParametersProvided] = useState(!!query.get('meetingId'));
  const [meetingId, setMeetingId] = useState(query.get('meetingId') || '');
  const [meetingTitle, setMeetingTitle] = useState(query.get('meetingTitle') || '');
  const [region, setRegion] = useState(query.get('region') || '');
  const [meetingMode, setMeetingMode] = useState(query.get('role')?.includes('Worker') ? MeetingMode.Host : MeetingMode.Attendee);
  const [joinInfo, setJoinInfo] = useState<JoinMeetingInfo | undefined>(undefined);
  const [layout, setLayout] = useState(Layout.Gallery);
  const [localUserName, setLocalUserName] = useState(`${query.get('name') ? decodeURI(query.get('name') || '') : ''} (${query.get('role') ? decodeURI(query.get('role') || '') : ''})`);
  const [isWebAudioEnabled, setIsWebAudioEnabled] = useState(true);
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [priorityBasedPolicy, setPriorityBasedPolicy] = useState<VideoPriorityBasedPolicy | undefined>(undefined);
  const [enableSimulcast, setEnableSimulcast] = useState(false);
  const [keepLastFrameWhenPaused, setKeepLastFrameWhenPaused] = useState(false);
  const [isEchoReductionEnabled, setIsEchoReductionEnabled] = useState(true);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });
  const [videoTransformCpuUtilization, setCpuPercentage] = useState(VideoFiltersCpuUtilization.CPU40Percent);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const [skipDeviceSelection, setSkipDeviceSelection] = useState(false);

  useEffect(() => {
    /* Load a canvas that will be used as the replacement image for Background Replacement */
    async function loadImage() {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx !== null) {
        const grd = ctx.createLinearGradient(0, 0, 250, 0);
        grd.addColorStop(0, '#000428');
        grd.addColorStop(1, '#004e92');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 500, 500);
        canvas.toBlob(function (blob) {
          if (blob !== null) {
            console.log('loaded canvas', canvas, blob);
            setImageBlob(blob);
          }
        });
      }
    }
    loadImage();
  }, []);

  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMeetingJoinDeviceSelection = (): void => {
    setSkipDeviceSelection((current) => !current);
  };

  const toggleWebAudio = (): void => {
    setIsWebAudioEnabled((current) => !current);
  };

  const toggleTranscription = (): void => {
    setIsTranscriptionEnabled((current) => !current);
  };

  const toggleSimulcast = (): void => {
    setEnableSimulcast((current) => !current);
  };

  const togglePriorityBasedPolicy = (): void => {
    if (priorityBasedPolicy) {
      setPriorityBasedPolicy(undefined);
    } else {
      setPriorityBasedPolicy(new VideoPriorityBasedPolicy(logger));
    }
  };

  const toggleKeepLastFrameWhenPaused = (): void => {
    setKeepLastFrameWhenPaused((current) => !current);
  };

  const setCpuUtilization = (filterValue: string): void => {
    setCpuPercentage(filterValue);
  };

  const setBlob = (imageBlob: Blob): void => {
    setImageBlob(imageBlob);
  };

  const toggleEchoReduction = (): void => {
    setIsEchoReductionEnabled((current) => !current);
  };

  const providerValue = {
    meetingId,
    meetingTitle,
    urlParametersProvided,
    localUserName,
    theme,
    isWebAudioEnabled,
    isTranscriptionEnabled,
    videoTransformCpuUtilization,
    imageBlob,
    isEchoReductionEnabled,
    region,
    meetingMode,
    layout,
    joinInfo,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    toggleTheme,
    toggleTranscription,
    toggleWebAudio,
    togglePriorityBasedPolicy,
    toggleKeepLastFrameWhenPaused,
    toggleSimulcast,
    setCpuUtilization,
    toggleEchoReduction,
    setMeetingMode,
    setLayout,
    setJoinInfo,
    setMeetingId,
    setMeetingTitle,
    setLocalUserName,
    setRegion,
    setBlob,
    skipDeviceSelection,
    toggleMeetingJoinDeviceSelection,
  };

  return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
}
