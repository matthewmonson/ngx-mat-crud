import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { merge, fromEvent, BehaviorSubject } from "rxjs";
import { TableDefinition } from '../interfaces/table-definition';
import { TableEventType } from '../enums/table-event-type-enum';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';
import { CrudEvent } from './crud-event';
import { FormDefinition } from './form-definition';

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

  reloadPage() {
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
