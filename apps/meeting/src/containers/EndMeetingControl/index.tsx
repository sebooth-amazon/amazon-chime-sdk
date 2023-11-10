// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
  useLogger,
  Textarea,
} from 'amazon-chime-sdk-component-library-react';

import { endMeeting } from '../../utils/api';
import { StyledP } from './Styled';
import { useAppState } from '../../providers/AppStateProvider';
import routes from '../../constants/routes';
import { useTranscriptions } from '../../providers/TranscriptionProvider';

const EndMeetingControl = () => {

  const logger = useLogger();
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('Summarizing meeting notes ...');
  const toggleModal = (): void => setShowModal(!showModal);
  const { meetingId } = useAppState();

  const history = useHistory();
  const { getTranscriptSummary, storeTranscriptionAndSummary } = useTranscriptions();
  const handleSumamryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
  };
  const leaveMeeting = async (): Promise<void> => {
    history.push(routes.ENDED);
  };

  const endMeetingForAll = async (): Promise<void> => {
    try {
      if (meetingId) {
        // send transcript and summary
        await storeTranscriptionAndSummary(summary);
        await endMeeting(meetingId);
        history.push(routes.ENDED);
      }
    } catch (e) {
      logger.error(`Could not end meeting: ${e}`);
    }
  };
  useEffect(() => {
    if (showModal) {
      getTranscriptSummary()
        .then(summaryResult => {
          setSummary(summaryResult);
        });
    }
  }, [showModal]);
  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="Leave" />
      {showModal && (
        <Modal size="lg" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="Meeting Summary" />
          <ModalBody>
            <StyledP>
              <Textarea
                value={summary}
                onChange={handleSumamryChange}
                placeholder="Meeting Summary"
                label="Meeting Summary"
              />
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                key="end-meeting-for-all"
                onClick={endMeetingForAll}
                variant="primary"
                label="End meeting for all"
              />,
              <ModalButton
                key="leave-meeting"
                onClick={leaveMeeting}
                variant="primary"
                label="Leave Meeting"
                closesModal
              />,
              <ModalButton
                key="cancel-meeting-ending"
                variant="secondary"
                label="Cancel"
                closesModal
              />,
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
