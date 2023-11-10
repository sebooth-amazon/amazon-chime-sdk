import { RosterAttendeeType, useAudioVideo, useMeetingManager, useRosterState } from 'amazon-chime-sdk-component-library-react';
import { Transcript, TranscriptEvent, TranscriptionStatus, TranscriptionStatusType } from 'amazon-chime-sdk-js';
import React, { useEffect, useReducer, createContext, useContext, FC, useCallback, PropsWithChildren } from 'react';
import { useAppState } from '../AppStateProvider';
import { saveSummary, startTranscription, summarize } from '../../utils/api';

import { DataMessagesActionType, initialState, TranscriptSummary, reducer } from './state';

function isTranscriptionStatus(transcriptEvent: TranscriptEvent): transcriptEvent is TranscriptionStatus {
  return (transcriptEvent as TranscriptionStatus).type !== undefined;
}
function isTranscript(transcriptEvent: TranscriptEvent): transcriptEvent is Transcript {
  return (transcriptEvent as Transcript).results !== undefined;
}

interface TranscriptionStateContextType {
  startTranscriptionService: () => void;
  getTranscriptSummary: () => Promise<string>;
  storeTranscriptionAndSummary: (updatedSummary: string) => Promise<void>;
  transcripts: TranscriptSummary[];
  transcriptionState: TranscriptionStatusType | null;
}

const TranscriptionStateContext = createContext<TranscriptionStateContextType | undefined>(undefined);

export const TranscriptionProvider: FC<PropsWithChildren> = ({ children }) => {
  const { meetingId } = useAppState();
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const { roster } = useRosterState();

  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (!audioVideo || !audioVideo.transcriptionController) {
      return;
    }
    audioVideo.transcriptionController?.subscribeToTranscriptEvent(handler);
    console.log('subscribed to transcription events');
    return () => {
      console.log('unsubscribed from transcription events');
      audioVideo.transcriptionController?.unsubscribeFromTranscriptEvent(handler);
    };
  }, [audioVideo, roster]);
  const lookupNameFromRoster = (attendeeId: string) => {
    let attendees = Object.values(roster);
    console.log('roster for transcription', JSON.stringify(roster));
    attendees = attendees.filter((attendee: RosterAttendeeType) =>
      attendee?.chimeAttendeeId === attendeeId
    );
    if (attendees.length !== 1) {
      return 'Unknown';
    }
    return attendees[0].name || 'Unknown';
  };
  const storeTranscriptionAndSummary = async (updatedSummary: string) => {

    const textTranscript = state.transcripts.reduce((summary, transcript) => { return `${summary}\n${transcript.senderName}:${transcript.transcript}`; }, '');

    return saveSummary(updatedSummary, textTranscript, meetingId);
  };
  const handler = (transcriptEvent: TranscriptEvent) => {
    console.log('transcription event', transcriptEvent);
    if (isTranscriptionStatus(transcriptEvent)) {
      // Print Transcript Status, could be `STARTED`, `INTERRUPTED`, `RESUMED`, `STOPPED` or `FAILED`
      console.log(`Transcript Status: ${transcriptEvent.type}`);

    } else if (isTranscript(transcriptEvent)) {

      const result = transcriptEvent.results[0];
      if (result.isPartial) return;
      const speakerAttendeeId = result.alternatives[0].items[0].attendee.attendeeId;
      const speakerName = lookupNameFromRoster(speakerAttendeeId);
      console.log(`${speakerAttendeeId} said ${result.alternatives[0].transcript}`);

      const isSelf = speakerAttendeeId === meetingManager.meetingSession?.configuration.credentials?.attendeeId;
      const transcript = result.alternatives[0].transcript;
      dispatch({
        type: DataMessagesActionType.ADD,
        payload: {
          transcript: transcript,
          senderAttendeeId: speakerAttendeeId,
          timestamp: result.alternatives[0].items[0].endTimeMs,
          senderName: speakerName,
          isSelf: isSelf,
        },
      });
    }
  };

  const getTranscriptSummary = useCallback(
    async () => {
      if (
        !meetingManager ||
        !meetingManager.meetingSession ||
        !meetingManager.meetingSession.configuration.credentials ||
        !meetingManager.meetingSession.configuration.credentials.attendeeId ||
        !audioVideo
      ) {
        return '';
      }
      const textTranscript = state.transcripts.reduce((summary, transcript) => { return `${summary}\n${transcript.senderName}:${transcript.transcript}`; }, '');
      const summary = await summarize(textTranscript, 'a conversation between a foster parent and a social worker');
      return summary;
    },
    [state.transcripts, roster]
  );


  const startTranscriptionService = useCallback(
    () => {
      if (
        !meetingManager ||
        !meetingManager.meetingSession ||
        !meetingManager.meetingSession.configuration.credentials ||
        !meetingManager.meetingSession.configuration.credentials.attendeeId ||
        !audioVideo
      ) {
        return;
      }
      startTranscription(meetingId);
    },
    [meetingManager, audioVideo]
  );

  const value = {
    startTranscriptionService,
    getTranscriptSummary,
    storeTranscriptionAndSummary,
    transcripts: state.transcripts,
    transcriptionState: null,
  };
  return <TranscriptionStateContext.Provider value={value}>{children}</TranscriptionStateContext.Provider>;
};

export const useTranscriptions = (): {
  startTranscriptionService: () => void;
  getTranscriptSummary: () => Promise<string>;
  storeTranscriptionAndSummary: (updatedSummary: string) => Promise<void>;
  transcripts: TranscriptSummary[];
  transcriptionState: TranscriptionStatusType | null;
} => {
  const meetingManager = useMeetingManager();
  const context = useContext(TranscriptionStateContext);
  if (!meetingManager || !context) {
    throw new Error(
      'Use useTranscriptions hook inside TranscriptionProvider. Wrap TranscriptionProvider under MeetingProvider.'
    );
  }
  return context;
};
