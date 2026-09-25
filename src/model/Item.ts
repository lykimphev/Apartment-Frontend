export interface ItemReq {
  itemName: string;
  itemNameKH: string;
  price: number;
  remark?: string;
  status?: string;
}

export interface ItemRes {
  id: number;
  itemName: string;
  itemNameKH: string;
  price: number;
  remark?: string;
  status?: string;
}