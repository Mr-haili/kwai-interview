import { ITask } from "./interface";

export const createTask = (
  props: Pick<ITask, "name" | "func"> &
    Partial<Pick<ITask, "children" | "parent">>
): ITask => {
  const { children = [], parent = null, ...rest } = props;
  const task: ITask = {
    ...rest,
    parent,
    children,
    timestamps: {
      begin: 0,
      end: 0,
    },
    status: "toBeStarted",
    isExecuted: false,
    childTaskOffset: -1,
  };
  return task;
};
