import { MovieStatus } from "../enums/MovieStatus.enum";

export interface UpdateMovie {
    ticketsAllotted?: number | null;
    adminOverrideStatus?: MovieStatus | null;
}