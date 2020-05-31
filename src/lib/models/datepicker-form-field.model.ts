import { FormFieldBase } from './form-field-base.model';

export class DatePickerFormField extends FormFieldBase<string> {
    controlType = 'date';
    
    constructor(options: {} = {}) {
        super(options);
        this.disabled=this.readonly;
    }
}
