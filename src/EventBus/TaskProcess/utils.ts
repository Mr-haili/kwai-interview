import { TaskProcess } from "./TaskProcess";

let maxProcessId = 1;

export const getProcessId = () => maxProcessId++;

/**
 * 打印当前函数调用栈
 */
export const printTaskProcessCallStack = (taskProcess: TaskProcess) => {
  let curTask = taskProcess.getCurTask();
  const msgStack: string[] = [];
  while (curTask) {
    msgStack.push(curTask.name);
    curTask = curTask.parent;
  }
};
