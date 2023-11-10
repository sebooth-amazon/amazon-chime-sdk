// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
} from 'amazon-chime-sdk-component-library-react';

import { StyledP } from './Styled';
import routes from '../../constants/routes';

const LeaveMeetingControl = () => {

  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);

  const history = useHistory();
  const leaveMeeting = async (): Promise<void> => {
    history.push(routes.ENDED);
  };

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="Leave" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="Leave Meeting" />
          <ModalBody>
            <StyledP>
              The meeting will end when the host ends the meeting or all participants leave.
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
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

export default LeaveMeetingControl;
