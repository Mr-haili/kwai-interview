import drawTable from "./drawTable";
import { ITableProps } from "./interface";

export const Table = <T extends object>(props: ITableProps<T>) => {
  const { dataSource, columns } = props;
  return drawTable(dataSource, columns);
};

export const TableFactory = <T extends object>(
  ctx: Omit<ITableProps<T>, "dataSource">
) => {
  return (props: Pick<ITableProps<T>, "dataSource">) => {
    return Table({
      ...ctx,
      ...props,
    });
  };
};
