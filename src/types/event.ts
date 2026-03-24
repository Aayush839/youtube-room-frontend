export type RoomEvent = {
  type:
    | "PLAY"
    | "PAUSE"
    | "SEEK"
    | "CHANGE_VIDEO"
    | "SYNC_STATE"  
    | "ASSIGN_ROLE"
    | "REMOVE_USER";

  roomId?: string;
  timestamp?: number;
  videoId?: string;
  userId?: string;

  playing?: boolean;

  hostId?: string;
  targetUserId?: string;
  role?: string;
};