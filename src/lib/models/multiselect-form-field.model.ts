import { FormFieldBase } from './form-field-base.model';
import { DisplayValue } from '../interfaces/display-value.interface';


export class MultiSelectFormField extends FormFieldBase<string> {
    controlType = 'multiselect';
    options : DisplayValue[] = [];
    defaultoptions : DisplayValue[] = [];
    requiredoptions : DisplayValue[] = [];
    constructor(options: {} = {}) {
        super(options);    
        this.disabled=this.readonly;
        this.options = options['options'] || [];
        this.defaultoptions = options['defaultoptions'] || [];
        this.requiredoptions = options['requiredoptions'] || [];
    }
}
