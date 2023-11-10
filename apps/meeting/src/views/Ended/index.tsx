// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import { title, StyledLayout } from './Styled';
import { VersionLabel } from '../../utils/VersionLabel';
import { Heading } from 'amazon-chime-sdk-component-library-react';

const Ended = () => (
  <StyledLayout>
    <Heading tag="h2" level={6} css={title}>
            The meeting has ended
    </Heading>
    <div>The meeting has ended, you may close this tab</div>
    <VersionLabel />
  </StyledLayout>
);

export default Ended;
