export interface Position {
  id: number;
  positionName: string;
  positionNameKh?: string;
  status?: string;
}

export interface PositionReq {
  positionName: string;
  positionNameKH?: string;
  status?: string;
}
