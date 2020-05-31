import { SortDirection } from "@angular/material/sort";

export interface TableEvent {
    eventType: any;    
    inputValue: string; 
    sortDirection: SortDirection; 
    pageIndex: number;
    pageSize: number;
}
