import { NgModule } from '@angular/core';

import { DynamicFormControlService } from './services/dynamic-form-control.service';
import { CrudComponent } from './components/crud.component';
import { DialogComponent, ConfirmDeleteDialogComponent } from './components/dialog.component';
import { FormComponent } from './components/form.component';
import { FormFieldComponent } from './components/form-field.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    CrudComponent,
    FormComponent,
    ConfirmDeleteDialogComponent,
    DialogComponent,
    FormFieldComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule
  ],  
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    CrudComponent,
    DialogComponent,
    FormComponent,
    FormFieldComponent,
    DialogComponent,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DynamicFormControlService
  ],
  entryComponents: [
    DialogComponent,
    ConfirmDeleteDialogComponent
  ]
})
export class NgxMatCrudModule { }
