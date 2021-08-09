import { ITask } from "./interface";
import { TaskProcess } from "./TaskProcess";

let maxProcessId = 1;

export const getProcessId = () => maxProcessId++;

const printTaskInfo = (task: ITask, deep: number) => {
  console.log(`${"-".repeat(deep * 2)}${task?.type} ${task?.name}`);
};

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
  console.log("");
  console.log(`==== 流程 id: ${taskProcess.processId} 当前调用栈开始 ====`);
  let deep = 0;
  while (0 < callTaskStacks.length) {
    const task = callTaskStacks.pop();
    task && printTaskInfo(task, deep);
    deep += 1;
  }
  console.log(`==== 流程 id: ${taskProcess.processId} 当前调用栈结束 ====\n`);
};

/**
 * 打印所有的以执行任务的历史调用栈
 */
export const printTaskProcesHistoryCallStack = (
  taskProcess: TaskProcess
): void => {
  const { rootTask } = taskProcess;
  const dfs = (task: ITask, deep: number) => {
    printTaskInfo(task, deep);
    for (let i = 0; i < task.childTaskOffset; i++) {
      dfs(task.children[i], deep + 1);
    }
  };

  console.log("");
  console.log(`==== 流程 id: ${taskProcess.processId} 历史调用栈开始 ====`);
  dfs(rootTask, 0);
  console.log(`==== 流程 id: ${taskProcess.processId} 历史调用栈结束 ====\n`);
};
