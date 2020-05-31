import { FormFieldBase } from './form-field-base.model';

export class ToggleFormField extends FormFieldBase<string> {
    controlType = 'toggle';
    type: string;

    constructor(options: {} = {}) {
        super(options);
        this.disabled=this.readonly;
        this.type = options['type'] || '';
    }
}
