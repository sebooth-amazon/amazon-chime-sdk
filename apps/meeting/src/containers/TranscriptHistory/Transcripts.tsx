import React, { useEffect, useRef } from 'react';

// import { Transcript } from 'amazon-chime-sdk-js';
import { StyledMessages } from './Styled';
import { useTranscriptions } from '../../providers/TranscriptionProvider';

export default function Transcripts() {
  const { transcripts } = useTranscriptions();

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (transcripts.length === 0) {
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts.length]);

  const renderMessages = () => {
    return transcripts.map((transcript) => (
      <div key={transcript.timestamp}>{transcript.senderName}:{transcript.transcript}</div>
    ));
  };

  return <StyledMessages ref={scrollRef}>{renderMessages()}</StyledMessages>;
}
