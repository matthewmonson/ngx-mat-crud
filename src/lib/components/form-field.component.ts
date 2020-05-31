import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormFieldBase } from '../models/form-field-base.model';
import { DisplayValue } from '../interfaces/display-value.interface';
import { DynamicFormControlService } from '../services/dynamic-form-control.service';
//import { LookupService } from './services/lookup.service';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'crud-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class FormFieldComponent implements OnInit {

  @Input() formField: FormFieldBase<any>;
  
  @Input() form: FormGroup;

  @ViewChild(MatAutocompleteTrigger) trigger;

  loading : boolean = false;
  loadingtext : string;

  //////////// START: MULTISELECT CONTROL ///////////// 
  @ViewChild('optionInput') optionInput: ElementRef<HTMLInputElement>;
  visible = true;
  selectable = false;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  multiselectOptionCtrl = new FormControl();
  filteredMultiselectOptions: Observable<DisplayValue[]>;
  chosenMultiselectOptions: DisplayValue[] = [];
  allMultiselectOptions: DisplayValue[] = [];
  requiredMultiselectOptions: DisplayValue[] = [];
  //////////// END: MULTISELECT CONTROL ///////////// 

  alldropdownValues: {value: DisplayValue, label: string}[] = [];
  dropdownValues: {value: DisplayValue, label: string}[] = [];
  filteredDropdownValues: Observable<{value: DisplayValue, label: string}[]>;

  constructor(/*private lookupService : LookupService,*/ private dfcs : DynamicFormControlService, private _ngZone : NgZone) { }

  ngOnInit() {
    
    // listen to group control events coming from dynamic form field service
    this.dfcs.getGroupControlEvents().subscribe(
      event => {
        if(event.eventype==='clearandfilterchild' && event.control===this.formField.parentkey) {
          if(event.value>'')
            this.dropdownValues = this.alldropdownValues.filter(value => value.value.parentVal===event.value);
          else
            this.dropdownValues=this.alldropdownValues;
          this.form.controls[this.formField.key].setValue('');              
          this.dfcs.setGroupControlEvent('clearandfilterchild', this.formField.key, '');
        } else 
            if(event.eventype==='clearandresetchild' && event.control===this.formField.parentkey) {
              this.dropdownValues=this.alldropdownValues;          
              this.form.controls[this.formField.key].setValue('');
              this.dfcs.setGroupControlEvent('clearandresetchild', this.formField.key, undefined);
            }
      });
    
    // listen to control events coming from dynamic form field service
    this.dfcs.getControlEvents().subscribe(
      event => {
          if(this.formField.exclusive && event.eventype==='excludefromothers' && event.control!=this.formField.key && (this.formField.type==='GROUP_BY' || this.formField.type==='DETAIL_COLUMNS')) {            
            let i=0;
            this.allMultiselectOptions.forEach(option => {
              if(option.val===event.value.val) {                
                this.allMultiselectOptions.splice(i,1);
              }
              i++;
            });
          } else
              if(this.formField.exclusive && event.eventype==='includebacktoothers' && event.control!=this.formField.key && (this.formField.type==='GROUP_BY' || this.formField.type==='DETAIL_COLUMNS')) {
                let found=false;
                this.allMultiselectOptions.forEach(option => {
                  if(option.val===event.value.val) {                    
                    found=true;
                  }
                });
                if(!found) {
                  this.allMultiselectOptions.push(event.value);
                }
              }
      });

    if(this.formField) 
    switch(this.formField.controlType) {

      case "multiselect": {        
        this.filteredMultiselectOptions = this.multiselectOptionCtrl.valueChanges.pipe(
          startWith<string | DisplayValue>(''),
          map(value => typeof value === 'string' ? value : value.label),
          map(label => label ? this._filterMultiselectOptions(label) : this.allMultiselectOptions.slice())
        );
        this.chosenMultiselectOptions = this.formField['defaultoptions'] || [];        
        this.requiredMultiselectOptions = this.formField['requiredoptions'] || [];
        for(let option of this.requiredMultiselectOptions) {
          if(this.chosenMultiselectOptions.indexOf(option)<0) {
            this.chosenMultiselectOptions.push(option);
          }
        }
        this.form.controls[this.formField.key].setValue(this.chosenMultiselectOptions); // formControlName does not bind properly on mat-chip-list, so do it manually      
        this.allMultiselectOptions = this.formField['options'] || [];                
        this.chosenMultiselectOptions.forEach(chosenoption => {
          if(this.formField.exclusive) {
            this.dfcs.addExclusionValue(chosenoption);          
            this.dfcs.setControlEvent('excludefromothers', this.formField.key, chosenoption);
          }
          this.allMultiselectOptions = this.allMultiselectOptions.filter(option => option.val!==chosenoption.val);
        });        
        if(this.formField.exclusive)
        this.dfcs.getExclusionValues().forEach(value => {
          this.allMultiselectOptions = this.allMultiselectOptions.filter(option => option.val!==value.val);
        });
        break;
      }

      case "dropdownsearch": {
        this.filteredDropdownValues = this.form.controls[this.formField.key].valueChanges.pipe(
          startWith<string | DisplayValue>(''),
          map(value => typeof value === 'string' ? value : value.label),
          map(label => label ? this._filterDropdownValues(label) : this.dropdownValues.slice())
        );
        this.loading=true;
        this.loadingtext="Loading " + this.formField.label + " data...";
        /*
        this.lookupService.lookup(this.formField['lookupName'], undefined).subscribe(
          (data : DisplayValue[]) => {
            let values=[];
            data.forEach(displayValue=>{       
              // first look for existing value, apparently 'for' loop is the fastest.
              let add = true;
              for(let item of values) {
                if(item.value['val']==displayValue.val) {
                  add = false;
                  break;
                }
              }
              // only add if doesn't already exist.
              if(add) {
                values.push({value: displayValue || undefined, label: displayValue.label });
              }
            });
            this.dropdownValues=values;
            this.alldropdownValues=this.dropdownValues;            
            this.loading=false;
            this.form.controls[this.formField.key].setValue('');
          },
          error => {
            console.error(error);
            this.loadingtext="ERROR: Failed to load " + this.formField.label + " data, please try again";
          }
        );
        */
        break;
      }

      case "toggle": {        
        this.isChecked=this.formField.value==='yes';             
        this.form.controls[this.formField.key].setValue(this.isChecked?'yes':'no');
        break;
      }

      case "checkbox": {        
        this.isChecked=this.formField.value==='yes';             
        this.form.controls[this.formField.key].setValue(this.isChecked?'yes':'no');
        break;
      }
    }    
  }

  get isValid() {        
    return this.form.controls[this.formField.key].valid; 
  }

  removeMultiselectOption(option: DisplayValue): void {    
    const index = this.chosenMultiselectOptions.indexOf(option);    
    if (index >= 0 && (this.requiredMultiselectOptions.indexOf(option) < 0) ) {
      this.chosenMultiselectOptions.splice(index, 1);      
      this.form.controls[this.formField.key].setValue(this.chosenMultiselectOptions); // formControlName does not bind properly on mat-chip-list, so do it manually
      this.allMultiselectOptions.push(option);
      // include this option back to other mutually exclusive controls
      if(this.formField.exclusive)
        this.dfcs.setControlEvent('includebacktoothers', this.formField.key, option);
    }
  }

  selectedMultiselectOption(event: MatAutocompleteSelectedEvent): void {        
    if( ( this.chosenMultiselectOptions.indexOf(event.option.value)<0 ) && 
        ( this.formField.maxvalues===0 || (this.formField.maxvalues>0 && this.chosenMultiselectOptions.length < this.formField.maxvalues) ) 
      ) {
      this.chosenMultiselectOptions.push(event.option.value);      
      this.form.controls[this.formField.key].setValue(this.chosenMultiselectOptions); // formControlName does not bind properly on mat-chip-list, so do it manually
      let i=0;
      this.allMultiselectOptions.forEach(value => {
        if(value.val===event.option.value.val) {
          this.allMultiselectOptions.splice(i,1);
        }
        i++;
      });
      // exclude this option from other mutually exclusive controls
      if(this.formField.exclusive)
        this.dfcs.setControlEvent('excludefromothers', this.formField.key, event.option.value);
    } 
    this.optionInput.nativeElement.value = '';
    this.multiselectOptionCtrl.setValue(null);        
  }

  public _filterMultiselectOptions(value: string): DisplayValue[] {
    const filterValue = value ? value.toLowerCase().trim() : '';
    return this.allMultiselectOptions.filter(option => (option.label && option.label.toLowerCase().indexOf(filterValue) === 0));
  }

  displayFn(displayValue?: DisplayValue): string | undefined {
    return displayValue ? displayValue.label : undefined;
  }

  private munchedDisplayValues: {value: DisplayValue, label: string}[] = [];
  private previousFilterValue: string = '';
  private _filterDropdownValues(value: string): {value: DisplayValue, label: string}[] {
    const filterValue = value.toLowerCase().trim();
    if(this.previousFilterValue > '' && value.startsWith(this.previousFilterValue) && value.length>this.previousFilterValue.length) {
      this.munchedDisplayValues = this.munchedDisplayValues.filter(value => { 
        let matches=0;
        let terms=0;
        filterValue.split(" ").forEach(term=>{
            if(term.trim()>'') {
              terms++;
              if(value.label.toLowerCase().indexOf(term)>-1) matches++;
            }
        });      
        return matches===terms;
      });
    } else {      
      this.munchedDisplayValues = this.dropdownValues.filter(value => { 
        let matches=0;
        let terms=0;
        filterValue.split(" ").forEach(term=>{
            if(term.trim()>'') {
              terms++;
              if(value.label.toLowerCase().indexOf(term)>-1) matches++;
            }
        });      
        return matches===terms;
      });
    }
    this.previousFilterValue=value;
    return this.munchedDisplayValues;
  }

  selectedGroupField(event: MatAutocompleteSelectedEvent): void {

    // reset any children controls and filter them by parent (this) value
    this.dfcs.setGroupControlEvent('clearandfilterchild', this.formField.key, event.option.value.value.val);
  }

  onGroupFieldBlur() {
    //REP-202
    //we put this in a timeoutblock because
    //this event fires before the selection event completes
    //so we need to give the selection event time to complete
    setTimeout(()=>{
      //ensure value is a valid option
      if(this.form.controls[this.formField.key].value){
        const _control = this.form.controls[this.formField.key];
        if(typeof _control.value === 'string'){
          //value is a string so it was manually typed in
          //and not selected from valid options
          //it is therefore invalid
          //so we reset it to an empty string
          _control.setValue('');
          this.dfcs.setGroupControlEvent('clearandresetchild', this.formField.key, undefined);
        }
      }else{
        // no value so reset any children controls and reset the filtering
        this.dfcs.setGroupControlEvent('clearandresetchild', this.formField.key, undefined);
      }
    },200);
  }

  public isChecked : boolean = false;
  toggleChanged($event) {
    this.isChecked=!this.isChecked;
    this.form.controls[this.formField.key].setValue(this.isChecked?'yes':'no');
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {        
    this.form.controls[this.formField.key].setValue(moment(event.value).format("YYYY-MM-DD"));
  }

  chipDropped(event: CdkDragDrop<DisplayValue[]>) {
    if(!(this.formField.disabled || this.formField.readonly))
    moveItemInArray(this.chosenMultiselectOptions, event.previousIndex, event.currentIndex);
  }

  openAutoCompletePanel() {
    setTimeout(() => {
      if(this.formField.maxvalues>0 && (this.chosenMultiselectOptions.length >= this.formField.maxvalues)) return;
      this.trigger.openPanel();
    }, 0)
  }
}
