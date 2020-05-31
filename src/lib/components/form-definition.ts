import { FormControlDefinition } from "../interfaces/form-control-definition.interface";

export interface FormDefinition {
    title : string;
    controls: FormControlDefinition[]
}