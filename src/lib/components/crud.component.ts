import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { merge, fromEvent, BehaviorSubject } from "rxjs";
import { TableDefinition } from '../interfaces/table-definition';
import { TableEventType } from '../enums/table-event-type-enum';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';
import { CrudEvent } from './crud-event';
import { FormDefinition } from './form-definition';
import { CrudEventType } from '../enums/crud-event-type-enum';

@Component({
  selector: 'confirm-delete-dialog',
  template: `
  <h2 mat-dialog-title>Delete {{message}}?</h2>

  <mat-dialog-actions>
      <button mat-button (click)="onNoClick()" cdkFocusInitial>No</button>
      <button mat-button (click)="onYesClick()">Yes Delete</button>
  </mat-dialog-actions>
  `
})
export class ConfirmDeleteDialogComponent {
  message;
  constructor(
      public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) { this.message = data }
  onNoClick(): void {
      this.dialogRef.close();
  }
  onYesClick(): void {
      this.dialogRef.close(true);
  }
}

@Component({
  selector: 'crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss']
})
export class CrudComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  @Input("tableDefinition")
  tableDefinition: TableDefinition;

  //@Output() tableEvent = new EventEmitter<TableEvent>();

  @Input("formDefinition")
  formDefinition: FormDefinition;

  @Output() crudEvent = new EventEmitter<CrudEvent>();

  @Input("listRecordsCallback")
  listRecordsCallback: Function;
  @Input("createRecordCallback")
  createRecordCallback: Function;
  @Input("readRecordCallback")
  readRecordCallback: Function;
  @Input("updateRecordCallback")
  updateRecordCallback: Function;
  @Input("deleteRecordCallback")
  deleteRecordCallback: Function;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  displayedColumns = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('input', { static: true }) input: ElementRef;

  eventCallbackFunction: Function;
  createRecordCallbackFunction: Function;
  updateRecordCallbackFunction: Function;
  deleteRecordCallbackFunction: Function;

  constructor(private dialog: MatDialog) {
    this.eventCallbackFunction = this.eventCallback.bind(this);
    this.createRecordCallbackFunction = this.createRecord.bind(this);
    this.updateRecordCallbackFunction = this.updateRecord.bind(this);
    this.deleteRecordCallbackFunction = this.deleteRecord.bind(this);
  }

  ngOnInit() {

    //define columns
    for (let column of this.tableDefinition.columns) {
      this.displayedColumns.push(column.dataField);
    }
    this.displayedColumns.push("actions");
  }

  ngAfterViewInit() {

    this.reloadPage();

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.reloadPage();
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.reloadPage())
      )
      .subscribe();
  }

  addRow() {
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      data: {
        formMode: "add",
        formDefinition: this.formDefinition,
        callbacks: {
          createRecord: this.createRecordCallbackFunction,
          updateRecord: this.updateRecordCallbackFunction,
          deleteRecord: this.deleteRecordCallbackFunction
        }
      },
    });
    dialogRef.afterClosed().subscribe(reload => {
      if (reload && reload == true) {
        this.reloadPage();
      }
    });
  }

  editRow(row) {
    this.loadingSubject.next(true);
    this.readRecordCallback(row[this.tableDefinition.rowKeyField]).subscribe(record => {
      this.loadingSubject.next(false);
      const dialogRef = this.dialog.open(DialogComponent, {
        disableClose: true,
        data: {
          formMode: "edit",
          formDefinition: this.formDefinition,
          formData: record,
          formKey: record[this.tableDefinition.rowKeyField],
          callbacks: {
            eventCallback: this.eventCallbackFunction,
            createRecord: this.createRecordCallbackFunction,
            updateRecord: this.updateRecordCallbackFunction,
            deleteRecord: this.deleteRecordCallbackFunction
          }
        },
      });
      dialogRef.afterClosed().subscribe(reload => {
        if (reload && reload == true) {
          this.reloadPage();
        }
      });
    },
      error => {
        this.loadingSubject.next(false);
        console.error(error);
      });
  }

  viewRow(row) {
    this.loadingSubject.next(true);
    this.readRecordCallback(row[this.tableDefinition.rowKeyField]).subscribe(record => {
      this.loadingSubject.next(false);
      const dialogRef = this.dialog.open(DialogComponent, {
        disableClose: true,
        data: {
          formMode: "view",
          formDefinition: this.formDefinition,
          formData: record,
          formKey: record[this.tableDefinition.rowKeyField],
          callbacks: {
            eventCallback: this.eventCallbackFunction,
            createRecord: this.createRecordCallbackFunction,
            updateRecord: this.updateRecordCallbackFunction,
            deleteRecord: this.deleteRecordCallbackFunction
          }
        },
      });
    },
      error => {
        this.loadingSubject.next(false);
        console.error(error);
      });
  }

  deleteRow(row) {
    const confirmDialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
        width: '350px',
        data: this.formDefinition.title + " " + row[this.tableDefinition.rowKeyField] 
      });
      confirmDialogRef.afterClosed().subscribe(result => {
        if(result && result==true) {
            this.loadingSubject.next(true);
                this.deleteRecord({eventType: CrudEventType.DELETECONFIRMED, key: row[this.tableDefinition.rowKeyField]}).subscribe(
                    success=> {
                        this.eventCallback({eventType: CrudEventType.SUCCESS, eventData: {message: "Record delete.", detail: success}});
                        this.loadingSubject.next(false);                            
                        //this.dialogRef.close(true);                            
                    },
                    error => {
                        this.eventCallback({eventType: CrudEventType.ERROR, eventData: {message: "Error during record delete.", detail: error}});
                        this.loadingSubject.next(false);
                    }
                )
        }
      });
  }

  reloadPage() {
    setTimeout( () => {
      this.loadingSubject.next(true);
      this.listRecordsCallback({
          eventType: TableEventType.QUERYDATASOURCE,
          inputValue: this.input.nativeElement.value,
          sortDirection: this.sort.direction,
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize
        }).subscribe(records => {
          this.dataSource = new MatTableDataSource<any>(records);
          this.dataSource.paginator = this.paginator;
          this.loadingSubject.next(false);
        },
        error => {
          this.loadingSubject.next(false);
          console.error(error);
        });
    },0);
  }

  eventCallback($event: CrudEvent): void {
    this.crudEvent.emit($event);
  }
  createRecord($event: CrudEvent): import("rxjs").Observable<any> {
    return this.createRecordCallback($event);
  }
  updateRecord($event: CrudEvent): import("rxjs").Observable<any> {
    return this.updateRecordCallback($event);
  }
  deleteRecord($event: CrudEvent): import("rxjs").Observable<any> {
    return this.deleteRecordCallback($event);
  }
}
