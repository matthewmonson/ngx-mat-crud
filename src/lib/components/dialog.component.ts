import { Inject, Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";

import { FormDefinition } from "./form-definition";
import { FormControlType } from "../enums/form-control-type-enum";
import { FormControlMode } from "../enums/form-control-mode-enum";

import { DynamicFormControlService } from "../services/dynamic-form-control.service";

import { FormFieldBase } from "../models/form-field-base.model";
import { TextboxFormField } from "../models/textbox-form-field.model";
import { CrudEvent } from "./crud-event";
import { Subject, BehaviorSubject } from "rxjs";
import { CrudEventType } from "../enums/crud-event-type-enum";
import { EventEmitter } from "events";

@Component({
    selector: 'confirm-delete-dialog',
    template: `
    <div mat-dialog-content>
        Delete this record?
        </div>
        <div mat-dialog-actions>
        <button mat-button (click)="onNoClick()" cdkFocusInitial>No</button>
        <button mat-button (click)="onYesClick()">Yes Delete</button>
        </div>
    `
})
export class ConfirmDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public message: string) { }
    onNoClick(): void {
        this.dialogRef.close();
    }
    onYesClick(): void {
        this.dialogRef.close(true);
    }
}

@Component({
    selector: 'crud-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

    formMode: string;
    formDefinition : FormDefinition;
    formData : any;
    formKey: any;

    formFields : FormFieldBase<any>[] = [];
    form : FormGroup;

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    
    crudEvent = new Subject<CrudEvent>();

    // function binding variables for dialog component callback
    public eventCallbackFunction: Function;
    public createRowCallbackFunction: Function;
    public updateRowCallbackFunction: Function;
    public deleteRowCallbackFunction: Function;

    onMessage = new EventEmitter();

    close() {
        this.dialogRef.close();
    }

    submit() {
        this.crudEvent.next({eventType: CrudEventType.FORMSUBMITTED})
    }

    delete() {
        const confirmDialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
            width: '350px'
          });
          confirmDialogRef.afterClosed().subscribe(result => {
            if(result && result==true) {
                this.loadingSubject.next(true);
                    this.deleteRecord({eventType: CrudEventType.DELETECONFIRMED, key: this.formKey}).subscribe(
                        success=> {
                            this.eventCallback({eventType: CrudEventType.SUCCESS, eventData: {message: "Record delete.", detail: success}});
                            this.loadingSubject.next(false);                            
                            this.dialogRef.close(true);                            
                        },
                        error => {
                            this.eventCallback({eventType: CrudEventType.ERROR, eventData: {message: "Error during record delete.", detail: error}});
                            this.loadingSubject.next(false);
                        }
                    )
            }
          });
    }

    // CrudEvents coming from the form component
    onFormEvent($event : CrudEvent) {        
        switch($event.eventType) {
            case CrudEventType.FORMSUBMITTED:
                if(this.formMode==='edit') {
                    this.loadingSubject.next(true);
                    this.updateRecord($event).subscribe(
                        success=> {
                            this.eventCallback({eventType: CrudEventType.SUCCESS, eventData: {message: "Record saved.", detail: success}});
                            this.loadingSubject.next(false);                            
                            this.dialogRef.close(true);                            
                        },
                        error => {
                            this.eventCallback({eventType: CrudEventType.ERROR, eventData: {message: "Error during record save.", detail: error}});
                            this.loadingSubject.next(false);
                        }
                    )
                } else {
                    if(this.formMode==='add') {
                        this.loadingSubject.next(true);
                        this.createRecord($event).subscribe(
                            success=> {
                                this.eventCallback({eventType: CrudEventType.SUCCESS, eventData: {message: "Record saved.", detail: success}});
                                this.loadingSubject.next(false);                            
                                this.dialogRef.close(true);                            
                            },
                            error => {
                                this.eventCallback({eventType: CrudEventType.ERROR, eventData: {message: "Error during record save.", detail: error}});
                                this.loadingSubject.next(false);
                            }
                        )
                    } 
                }
                break;
        }
    }

    constructor(
        private dfcs : DynamicFormControlService,
        private dialogRef: MatDialogRef<DialogComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) data) {

        // bind to crud component callback functions
        this.eventCallbackFunction=data.callbacks.eventCallback;
        this.createRowCallbackFunction=data.callbacks.createRecord;
        this.updateRowCallbackFunction=data.callbacks.updateRecord;
        this.deleteRowCallbackFunction=data.callbacks.deleteRecord;

        // set up form properties
        this.formMode = data.formMode;
        this.formDefinition = data.formDefinition;     
        this.formData = data.formData;      
        this.formKey = data.formKey;

        // convert formDefinition.controls to formFields needed by form.component.ts
        this.formDefinition.controls.sort((n1, n2) => n1.position - n2.position).forEach( control => {

            let dynamicFormControl = {  
                value: this.formMode=="edit" ? this.formData[control.dataSourceField] : null,
                label: control.label,
                key: control.dataSourceField,
                required: control.required,
                order: control.position,                                                
                readonly: this.formMode==="edit" && control.editMode==FormControlMode.READONLY ? true : (this.formMode=="add" && control.addMode==FormControlMode.READONLY ? true : false)
            };

            // TODO
            switch(control.controlType) {
                case FormControlType.TEXTBOX:
                    this.formFields.push(
                        new TextboxFormField(dynamicFormControl)
                    )
                    break;                
            }
        });

        console.log("FORM FIELDS: " + JSON.stringify(this.formFields));
    }

    eventCallback($event : CrudEvent) : void {
        this.eventCallbackFunction($event);
    }
    createRecord($event: CrudEvent): import("rxjs").Observable<any> {
        return this.createRowCallbackFunction($event);
    }
    updateRecord($event: CrudEvent): import("rxjs").Observable<any> {
        return this.updateRowCallbackFunction($event);
    }
    deleteRecord($event: CrudEvent): import("rxjs").Observable<any> {
        return this.deleteRowCallbackFunction($event);
    }
}
