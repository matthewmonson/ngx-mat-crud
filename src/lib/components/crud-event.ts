import { CrudEventType } from "../enums/crud-event-type-enum";

export interface CrudEvent {
    eventType: CrudEventType;
    key?: any;    
    eventData?: any | {message: string, detail: string};
}