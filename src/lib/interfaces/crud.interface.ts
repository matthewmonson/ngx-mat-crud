import { TableEvent } from "../components/table-event";
import { CrudEvent } from "../components/crud-event";
import { Observable } from "rxjs";

export declare interface Crud {
    /**
     * Method to catch any events coming from the Crud module
     * @param $event: CrudEvent
     */
    onCrudEvent($event : CrudEvent):void;
    /**
     * Observable to wait on when listing records
     */
    onListRecords($event : TableEvent):Observable<any>;
    /**
     * Observable to wait on when adding a new record
     */
    onCreateRecord($event : CrudEvent):Observable<any>;
    /**
     * Observable to wait on when reading a single record
     */
    onReadRecord($event : CrudEvent):Observable<any>;
    /**
     * Observable to wait on when updating a record
     */
    onUpdateRecord($event : CrudEvent):Observable<any>;
    /**
     * Observable to wait on when deleting a record
     */
    onDeleteRecord($event : CrudEvent):Observable<any>;
}
