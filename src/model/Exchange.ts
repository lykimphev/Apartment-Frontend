export interface ExchangeReq {
  date?: string;
  rate: number;
  status?: string;
  isDelete?: boolean;
}

export interface ExchangeRes {
  id: number;
  date: string;
  rate: number;
  status: string;
  isDelete: boolean;
}
