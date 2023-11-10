// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import routes from '../constants/routes';
import JSON5 from 'json5';
import truncate from 'just-truncate';

export const BASE_URL = routes.HOME;

export type MeetingFeatures = {
  Audio: {[key: string]: string};
}

export type CreateMeetingResponse = {
  MeetingFeatures: MeetingFeatures;
  MediaRegion: string;
}

export type JoinMeetingInfo = {
  Meeting: CreateMeetingResponse;
  Attendee: string;
}

interface MeetingResponse {
  JoinInfo: JoinMeetingInfo;
}

interface GetAttendeeResponse {
  name: string;
}

export async function fetchMeeting(
  meetingId: string,
  name: string,
  region: string,
  echoReductionCapability = false
): Promise<MeetingResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    name: encodeURIComponent(name),
    region: encodeURIComponent(region),
    ns_es: String(echoReductionCapability),
  };

  const res = await fetch(BASE_URL + 'join?' + new URLSearchParams(params), {
    method: 'POST',
  });
  if(!res.ok){
    const rawResponse = await res.text();
    throw new Error(`Server error: ${rawResponse}`);
  }
  try{
    const data = await res.json();
    if (data.error) {
      throw new Error(`Server error: ${data.error}`);
    }
  
    return data;
  }
  catch (error){
    throw new Error(`Server error: ${error}`);
  }
  
}

export async function getAttendee(
  meetingId: string,
  chimeAttendeeId: string
): Promise<GetAttendeeResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    attendee: encodeURIComponent(chimeAttendeeId),
  };

  const res = await fetch(BASE_URL + 'attendee?' + new URLSearchParams(params), {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Invalid server response');
  }

  const data = await res.json();

  return {
    name: data.AttendeeInfo.Name,
  };
}

export async function endMeeting(meetingId: string): Promise<void> {
  const params = {
    title: encodeURIComponent(meetingId),
  };

  const res = await fetch(BASE_URL + 'end?' + new URLSearchParams(params), {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Server error ending meeting');
  }
}

export async function startTranscription(meetingId: string): Promise<void> {
  const params = {
    title: encodeURIComponent(meetingId),
  };

  const res = await fetch(BASE_URL + 'startTranscription?' + new URLSearchParams(params), {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Server error starting transcription');
  }
}

export async function stopTranscription(meetingId: string): Promise<void> {
  const params = {
    title: encodeURIComponent(meetingId),
  };

  const res = await fetch(BASE_URL + 'stopTranscription?' + new URLSearchParams(params), {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Server error stoppping transcription');
  }
}

export async function saveSummary(summary: string, transcript: string, meetingId: string): Promise<void> {
  
      
  const res = await fetch(BASE_URL + 'saveSummary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },    
    body:JSON.stringify({
      summary: truncate(summary,5000), 
      transcript:truncate(transcript,5000), 
      meetingId}),
  });

  if (!res.ok) {
    throw new Error(`Server error saving summary ${await res.text()}`);
  }  
}


export async function summarize(transcript: string, context = 'a conversation between meeting participants'): Promise<string> {
  
  const prompt = `given ${context}, summarize the meeting. Explain breifly what the meeting was about, identify any action items, assess the overall sentiment in 2 or 3 words. If you do not have enough information, say so. Do not make up names or roles you have not been provided with in the conversation.\n<conversation>\n${transcript}</conversation>`;
      
  const res = await fetch(BASE_URL + 'summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },    
    body:JSON.stringify({transcript:prompt}),
  });

  if (!res.ok) {
    throw new Error('Server error summarizing transcript');
  }
  const summaryResponseJson = await res.json();
  const summaryText = summaryResponseJson.completion;
  return Promise.resolve(summaryText);
}
type SanitizeResponse = {
  risk:number;
  explaination: string;
  redacted: string;
}
export async function sanitize(message: string, context = 'a conversation between meeting participants'): Promise<SanitizeResponse> {
  
  const prompt = `there is ${context}, given a message about to be sent, rate the risk factor between 1 and 10 where 1 is low risk and 10 is high risk or revealing or soliciting the home location of the subject under discussion.\n
    <message>\n
    ${message}\n
    </message>\n
    provide a structured response with the value and explaination seperately as well as a redacted version of the message that is less likely to reveal their home location in json format. Return only the valid JSON, do not include text before or after the json object.:\n
    If you do not have enough information, return and empty object {}. Do not make up names or roles you have not been provided with in the conversation.\n
    {"risk":5,"explaination":"explaination here","redacted","alternative message here"}\n
    is this message likely to reveal the subject location? `;
        
  const res = await fetch(BASE_URL + 'sanitize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },    
    body:JSON.stringify({transcript:prompt}),
  });

  if (!res.ok) {
    throw new Error('Server error sanitizing message');
  }
  const sanitizedResponseResultJson = await res.json();
  // Using JSON5 https://github.com/json5/json5 in case the GenAI model returns imperfect JSON
  let sanitizedResponse = <SanitizeResponse>{risk:0};
  try{
    sanitizedResponse = await JSON5.parse(sanitizedResponseResultJson.completion) as SanitizeResponse;
  }
  catch (err) {
    console.log(`Error parsing response ${sanitizedResponseResultJson.completion}`);
  }
  return Promise.resolve(sanitizedResponse);
}
export const createGetAttendeeCallback = (meetingId: string) =>
  (chimeAttendeeId: string): Promise<GetAttendeeResponse> =>
    getAttendee(meetingId, chimeAttendeeId);
