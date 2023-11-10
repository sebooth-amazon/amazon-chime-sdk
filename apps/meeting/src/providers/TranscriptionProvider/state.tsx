export interface TranscriptSummary {
  transcript: string;
  senderAttendeeId: string;
  timestamp: number;
  senderName: string;
  isSelf: boolean;
}

export interface State {
  transcripts: TranscriptSummary[];
}

export enum DataMessagesActionType {
  ADD,
}

export interface AddAction {
  type: DataMessagesActionType.ADD;
  payload: TranscriptSummary;
}

export const initialState: State = {
  transcripts: [],
};

export type Action = AddAction;

export function reducer(state: State, action: Action): State {
  const { type, payload } = action;
  switch (type) {
    case DataMessagesActionType.ADD:
      return { transcripts: [...state.transcripts, payload] };
    default:
      throw new Error('Incorrect action in DataMessagesProvider reducer');
  }
}
