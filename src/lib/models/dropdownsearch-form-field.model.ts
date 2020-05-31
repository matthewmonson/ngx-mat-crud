import { FormFieldBase } from './form-field-base.model';
import { DisplayValue } from '../display-value.interface';

export class DropdownSearchFormField extends FormFieldBase<string> {
    controlType = 'dropdownsearch';
    options : DisplayValue[] = [];
    defaultoptions : DisplayValue[] = [];
    type: string;
    lookupName: string;
    constructor(options: {} = {}) {
        super(options);    
        this.disabled=this.readonly;
        this.options = options['options'] || [];
        this.defaultoptions = options['defaultoptions'] || [];
        this.type = options['type'] || '';
        this.lookupName = options['lookupName'] || '';
    }
}
