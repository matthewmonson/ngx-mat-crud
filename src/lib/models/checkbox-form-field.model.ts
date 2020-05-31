import { FormFieldBase } from './form-field-base.model';

export class CheckboxFormField extends FormFieldBase<string> {
    controlType = 'checkbox';
    type: string;

    constructor(options: {} = {}) {
        super(options);
        this.disabled=this.readonly;
        this.type = options['type'] || '';
    }
}
