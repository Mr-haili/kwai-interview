import { getProcessId } from "./utils";
import { ITask, TaskFunc } from "./interface";
import { createTask } from "./Task";

/**
 * 任务完成即当前任务已经执行过，并且其子任务也都已经完成
 */
const checkTaskComplete = (task: ITask): boolean =>
  task.isExecuted && task.childTaskOffset === task.children.length;

export class TaskProcess {
  private curTask: ITask;
  readonly processId: number;

  constructor(readonly rootTask: ITask) {
    this.curTask = rootTask;
    this.processId = getProcessId();
  }

  checkRootTaskComplete(): boolean {
    return checkTaskComplete(this.rootTask);
  }

  /**
   * 最小执行单元是一个任务
   */
  async step() {
    if (this.checkRootTaskComplete()) {
      return;
    }
    let curTask: ITask | null = this.curTask;
    while (curTask && checkTaskComplete(curTask)) {
      curTask = curTask.parent;
    }
    if (!curTask) {
      return;
    }
    if (!curTask.isExecuted) {
      // 任务执行函数是需要外部来提供的
      const addChildTask = (name: string, func: TaskFunc) => {
        const task = createTask({
          name,
          func,
          parent: curTask,
        });
        curTask && curTask.children.push(task);
      };
      curTask.timestamps.begin = Date.now();
      try {
        await curTask.func({ addChildTask });
      } catch (error) {
        console.error(error);
      } finally {
        curTask.timestamps.end = Date.now();
        curTask.isExecuted = true;
      }
    }
    // 当前任务执行完毕，可能衍生了子任务，若有我们切到子任务节点
    if (curTask.childTaskOffset < curTask.children.length) {
      curTask.childTaskOffset += 1;
      curTask = curTask.children[curTask.childTaskOffset];
    }
  }
}
