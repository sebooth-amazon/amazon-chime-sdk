import React from 'react';
import Transcripts from './Transcripts';
import { StyledTranscript, StyledTitle } from './Styled';
import { IconButton, Remove } from 'amazon-chime-sdk-component-library-react';
import { useNavigation } from '../../providers/NavigationProvider';
import { useTranscriptions } from '../../providers/TranscriptionProvider';
import { TranscriptionStatusType } from 'amazon-chime-sdk-js';

export default function TranscriptHistory() {
  const { toggleTranscript } = useNavigation();
  const { startTranscriptionService, transcriptionState } = useTranscriptions();
  return (
    <StyledTranscript className="transcript">
      <StyledTitle>
        <div className="ch-title">Transcript</div>
        <div className="close-button">
          <IconButton icon={<Remove />} label="Close" onClick={toggleTranscript} />
        </div>
      </StyledTitle>
      <Transcripts />
      {transcriptionState}
      {transcriptionState !== TranscriptionStatusType.STARTED ? <button onClick={() => { startTranscriptionService(); }} type="button" >Start</button> : null}
    </StyledTranscript>
  );
}
