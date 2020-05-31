import { FormFieldBase } from './form-field-base.model';

export class TextboxFormField extends FormFieldBase<string> {
    controlType = 'textbox';
    type: string;

    constructor(options: {} = {}) {
        super(options);
        this.type = options['type'] || '';
    }
}
