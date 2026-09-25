import type { FloorRes } from "./FloorRes";
import type { RoomTypeRes } from "./RoomType";

export interface RoomReq {
  roomNo: string;
  roomtypeId: number;
  floorId: number;
  price: number;
  serviceCharge: number;
  roomKey?: string;
  status?: string;
  note?: string;
}

export interface RoomRes {
  id: number;
  roomNo: string;
  roomtypeId: number;
  roomtype?: RoomTypeRes;
  floorId: number;
  floor?: FloorRes;
  price: number;
  serviceCharge: number;
  roomKey?: string;
  status?: string;
  note?: string;
}
