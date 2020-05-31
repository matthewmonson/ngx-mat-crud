import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFieldBase } from '../models/form-field-base.model';
import { Subject, Observable } from 'rxjs';
import { DisplayValue } from '../interfaces/display-value.interface';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormControlService {

  constructor() { }

  toFormGroup(fields: FormFieldBase<any>[] ) {
    let group: any = {};    
    fields.forEach(field => {            
      console.log(field.key + " - disabled: " + field.disabled + " readonly: " + field.readonly);
      group[field.key] = new FormControl({value: field.value || '', disabled: field.disabled}, field.required ? Validators.required : Validators.nullValidator);
    });
    return new FormGroup(group);
  }

  private groupControlEvents = new Subject<any>();
  setGroupControlEvent(eventype: string, control : string, value : any) {
    this.groupControlEvents.next({ eventype: eventype, control: control, value: value });
  }

  getGroupControlEvents() : Observable<any> {
    return this.groupControlEvents.asObservable();
  }

  private controlEvents = new Subject<any>();
  setControlEvent(eventype: string, control : string, value : any) {
    this.controlEvents.next({ eventype: eventype, control: control, value: value });
  }

  getControlEvents() : Observable<any> {
    return this.controlEvents.asObservable();
  }

  private exclusionvalues : DisplayValue[] = [];
  addExclusionValue(displayValue) {
    let found=false;
    this.exclusionvalues.forEach(value=>{
      if(value.val===displayValue.val)
        found=true;
    });
    if(!found) {
      this.exclusionvalues.push(displayValue);
    }
  }
  getExclusionValues() : DisplayValue[] {
    return this.exclusionvalues;
  }
  clearExclusionValues() {
    this.exclusionvalues=[];
  }
}
