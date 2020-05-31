import { FormControlMode } from '../enums/form-control-mode-enum';
import { FormControlType } from '../enums/form-control-type-enum';

export interface FormControlDefinition {
    dataSourceField: string;
    position: number;
    label: string;
    editMode: FormControlMode;
    addMode: FormControlMode;
    required: boolean;
    controlType: FormControlType;
}
