export class FormFieldBase<T> {
    options: any;
    value: T;
    key: string;
    label: string;
    required: boolean;
    order: number;
    type: string;
    controlType: string;
    hidden: boolean;
    appearance: string;
    floatlabel: string;
    disabled: boolean;
    parentkey: string;
    group: string;
    exclusive: boolean;
    readonly: boolean;
    maxvalues: number;
    constructor(options: {
        value?: T,
        key?: string,
        label?: string,
        required?: boolean,
        order?: number,
        type?: string,
        controlType?: string,
        hidden?: boolean,
        appearance?: string,
        floatlabel? : string,
        disabled?: boolean,
        parentkey?: string,
        group?:string,
        exclusive?: boolean,
        readonly?: boolean,
        maxvalues?: number
      } = {}) {
      this.options = options;
      this.value = options.value;
      this.key = options.key || '';
      this.label = options.label || '';
      this.required = options.required || false;
      this.order = options.order === undefined ? 1 : options.order;
      this.type = options.type;
      this.controlType = options.controlType || '';
      this.hidden = options.hidden || false;
      this.appearance = options.appearance || 'standard';
      this.floatlabel = options.floatlabel || 'never';
      this.disabled = options.disabled || false;
      this.parentkey = options.parentkey || '';
      this.group = options.group || undefined;
      this.exclusive = options.exclusive || false;
      this.readonly = options.readonly || false;
      this.maxvalues = options.maxvalues || 0;
    }
  }
