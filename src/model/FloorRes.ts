import type {Building} from "./Building";
export interface FloorRes {
    id: number;
    floorNo: number;
    buildingId: number;
    building: Building;
}