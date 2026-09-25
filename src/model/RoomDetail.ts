import type { ItemRes } from "./Item";
import type { RoomRes } from "./Room";

export interface RoomDetailReq {
  roomId: number;
  itemId: number;
  price: number;
}

export interface RoomDetailRes {
  id: number;
  roomId: number;
  itemId: number;
  price: number;
  room?: RoomRes;
  item?: ItemRes;
}
