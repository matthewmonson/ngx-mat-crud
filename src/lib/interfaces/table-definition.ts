export interface TableDefinition {
    columns: {headingLabel: string, dataField: string }[];
    pageSizes: number[];
    defaultPageSize: number;
    defaultSortColumn: string;
    rowKeyField: string;
}
