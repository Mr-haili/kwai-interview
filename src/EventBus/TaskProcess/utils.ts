import { ITask } from "./interface";
import { TaskProcess } from "./TaskProcess";

let maxProcessId = 1;

export const getProcessId = () => maxProcessId++;

/**
 * 打印当前函数调用栈
 */
export const printTaskProcessCallStack = (taskProcess: TaskProcess): void => {
  // 获取任务栈
  let curTask = taskProcess.getCurTask();
  const callTaskStacks: Readonly<ITask>[] = [];
  while (curTask) {
    callTaskStacks.push(curTask);
    curTask = curTask.parent;
  }

  // 打印出来
  console.log(`==== 流程 id: ${taskProcess.processId} 调用栈开始 ====`);
  let deep = 0;
  while (0 < callTaskStacks.length) {
    const task = callTaskStacks.pop();
    console.log(`${"-".repeat(deep * 2)}${task?.type} ${task?.name}`);
    deep += 1;
  }
  console.log(`==== 流程 id: ${taskProcess.processId} 调用栈结束 ====`);
};
