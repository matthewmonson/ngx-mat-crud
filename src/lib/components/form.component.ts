import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormFieldBase } from '../models/form-field-base.model';
import { DynamicFormControlService } from '../services/dynamic-form-control.service';
import { CrudEvent } from './crud-event';
import { CrudEventType } from '../enums/crud-event-type-enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'crud-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  providers: [DynamicFormControlService]
})
export class FormComponent implements OnInit {

  @Input() crudEvent: Subject<CrudEvent>;

  @Input() formKey: any;

  @Input() formFields: FormFieldBase<any>[] = [];

  @Output() formEvent = new EventEmitter<CrudEvent>();

  formGroup : FormGroup;
  
  constructor( private rfcs: DynamicFormControlService) {     
  }

  ngOnInit() {    
    this.formGroup = this.rfcs.toFormGroup(this.formFields);
    this.crudEvent.subscribe(event => {
      switch(event.eventType) {
        case CrudEventType.FORMSUBMITTED:
          if(this.formGroup.valid) {
            this.formEvent.emit({eventType: CrudEventType.FORMSUBMITTED, key: this.formKey, eventData: this.formGroup.value});
          }
          break;
          case CrudEventType.FORMDISABLED:
            this.formGroup.disable();
            break;
      }      
    });
  }
}
