import { ActionType, Input, Severity, useNotificationDispatch } from 'amazon-chime-sdk-component-library-react';
import React, { ChangeEvent, useState } from 'react';
import { useDataMessages } from '../../providers/DataMessagesProvider';
import { StyledChatInputContainer } from './Styled';
import { sanitize } from '../../utils/api';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const { sendMessage } = useDataMessages();
  const dispatch = useNotificationDispatch();

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // TODO: Due to mismatch in React versions installed in demo vs the one onKeyPress accepts in component library
  // there is a problem with KeyboardEvent type here.
  // For now use, any as type and cast internally to KeyboardEvent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyPress = async (event: any) => {
    if ((event as KeyboardEvent).key === 'Enter') {
      setProcessing(true);
      // santize message
      const sanitizeResult = await sanitize(message);
      console.log(`sanitization result ${sanitizeResult.risk}`, sanitizeResult);
      if (sanitizeResult.risk >= 4) {
        const payload: { severity: Severity; message: string, autoClose: boolean } = {
          severity: Severity.WARNING,
          message: sanitizeResult.explaination,
          autoClose: true,
        };
        dispatch({
          type: ActionType.ADD,
          payload: payload,
        });
        setMessage(sanitizeResult.redacted);
        setProcessing(false);
        return;
      }
      sendMessage(message);
      setMessage('');
      setProcessing(false);
    }
  };

  return (
    <StyledChatInputContainer>
      <Input
        value={message}
        onChange={handleMessageChange}
        onKeyPress={handleKeyPress}
        placeholder="Message all attendees"
        disabled={processing}
      />
    </StyledChatInputContainer>
  );
}
