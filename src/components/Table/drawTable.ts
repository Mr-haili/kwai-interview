import { ColumnProps } from "./interface";

const CHARS = {
  Space: " ",
  CellSeparater: "|",
  Enter: "\n",
} as const;

/**
 * NOTE: 过于粗放
 */
type LayoutedColumnProps<T extends object> = Required<ColumnProps<T>>;

/**
 * 一列的宽度，由 title 和数据中最长的文本，以及 width 共同决定
 */
const calcColumnWidth = <T extends object>(
  dataSource: ReadonlyArray<T>,
  column: ColumnProps<T>
): number => {
  const { title, name, width } = column;
  const contentMaxWidth = dataSource.reduce((acc, cur) => {
    return Math.max(acc, String(cur[name]).length);
  }, String(title).length);
  return width ? Math.max(width) : contentMaxWidth;
};

const layoutColumns = <T extends object>(
  dataSource: ReadonlyArray<T>,
  columns: ReadonlyArray<ColumnProps<T>>
): ReadonlyArray<LayoutedColumnProps<T>> =>
  columns.map((column) => {
    const width = calcColumnWidth(dataSource, column);
    return { ...column, width };
  });

/**
 * 绘制表的某一行
 */
const drawRow = <T extends Object>(
  data: T,
  columns: ReadonlyArray<LayoutedColumnProps<T>>
): string => {
  const cells: string[] = [];
  columns.forEach(({ name, width }) => {
    let content = String(data[name]);
    content = content.padEnd(width, CHARS.Space);
    cells.push(`${CHARS.Space}${CHARS.Space}${content}${CHARS.Space}`);
  });
  return cells.join(CHARS.CellSeparater);
};

const drawTable = <T extends object>(
  dataSource: ReadonlyArray<T>,
  columns: ReadonlyArray<ColumnProps<T>>
) => {
  const layoutedColumns = layoutColumns(dataSource, columns);

  const lines: string[] = [];

  // NOTE: 绘制表头，用一点 trick 不得已 any
  const headerData = columns.reduce((acc, { title, name }) => {
    acc[name] = title;
    return acc;
  }, {} as any) as T;
  const headerRow = drawRow(headerData, layoutedColumns);
  lines.push(headerRow);

  // 绘制表身
  const bodyRows: string[] = dataSource.map((data) =>
    drawRow(data, layoutedColumns)
  );
  lines.push(...bodyRows);

  // 组合起来
  const table = lines.join(CHARS.Enter);
  return table;
};

export default drawTable;
