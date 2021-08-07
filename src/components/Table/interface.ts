export interface ColumnProps<T extends object> {
  title: string;
  name: keyof T;
  width?: number;
}

export interface ITableProps<T extends object> {
  dataSource: ReadonlyArray<T>;
  columns: ReadonlyArray<ColumnProps<T>>;
}
