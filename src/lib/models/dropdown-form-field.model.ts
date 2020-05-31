import { FormFieldBase } from './form-field-base.model';
import { DisplayValue } from '../interfaces/display-value.interface';

export class DropdownFormField extends FormFieldBase<string> {
    controlType = 'dropdown';
    options: DisplayValue[] = [];

    constructor(options: {} = {}) {
        super(options);
        this.disabled=this.readonly;
        this.options = options['options'] || [];
    }
}
