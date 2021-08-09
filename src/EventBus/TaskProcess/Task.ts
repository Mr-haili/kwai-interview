import { ITask } from "./interface";

export const createTask = <TType extends string>(
  props: Pick<ITask<TType>, "name" | "func" | "type"> &
    Partial<Pick<ITask, "children" | "parent">>
): ITask<TType> => {
  const { children = [], parent = null, ...rest } = props;
  const task: ITask<TType> = {
    ...rest,
    parent,
    children,
    timestamps: {
      begin: 0,
      end: 0,
    },
    status: "toBeStarted",
    isExecuted: false,
    childTaskOffset: 0,
  };
  return task;
};
