import type { Guest } from "./Guest";
import type { RoomRes } from "./Room";
import type { ExchangeRes } from "./Exchange";
import type { User } from "./User";

export interface BookingReq {
  bookingNo?: string;
  bookingDate?: string;
  guestId?: number;
  userId?: number;
  roomId?: number;
  exchangeId?: number;
  total?: number;
  payDollar?: number;
  payRiel?: number;
  updateby?: number;
  updateDate?: string;
  checkInDate?: string;
  expireDate?: string;
  status?: string;
  note?: string;
}

export interface BookingRes {
  id: number;
  bookingNo?: string;
  bookingDate: string;
  guestId?: number;
  guest?: Guest;
  userId?: number;
  user?: User;
  roomId?: number;
  room?: RoomRes;
  exchangeId?: number;
  exchange?: ExchangeRes;
  total?: number;
  payDollar?: number;
  payRiel?: number;
  updateby?: number;
  updateDate?: string;
  checkInDate?: string;
  expireDate?: string;
  status?: string;
  note?: string;
}
