import { ITask, ITaskFuncContext } from "./interface";
import { createTask } from "./Task";
import { getProcessId } from "./utils";

/**
 * 任务完成即当前任务已经执行过，并且其子任务也都已经完成
 */
const checkTaskComplete = (task: ITask): boolean =>
  task.isExecuted && task.childTaskOffset === task.children.length;

export class TaskProcess {
  private curTask: ITask | null;
  readonly processId: number;

  constructor(readonly rootTask: ITask) {
    this.curTask = rootTask;
    this.processId = getProcessId();
  }

  getCurTask(): Readonly<ITask> | null {
    return this.curTask;
  }

  checkRootTaskComplete(): boolean {
    return checkTaskComplete(this.rootTask);
  }

  /**
   * 如果当前任务执行完成，会进入到下一个需要完成的任务中，
   * 更新 curTask 为要执行的任务，若所有任务都完成返回 null
   */
  private gotoNextTask = () => {
    let curTask = this.curTask;
    while (curTask && checkTaskComplete(curTask)) {
      const { parent } = curTask;
      if (parent) {
        parent.childTaskOffset += 1;
      }
      curTask = parent;
    }

    // 要么所有任务都已经完成了 curTask 为 null
    if (!curTask) {
      this.curTask = curTask;
    } else {
      // 要么当前任务还有没有完成的子任务，进入到该子任务中
      this.curTask = curTask.children[curTask.childTaskOffset];
    }
  };

  /**
   * 最小执行单元是一个任务
   */
  async step() {
    if (this.checkRootTaskComplete()) {
      return;
    }
    let curTask: ITask | null = this.curTask;
    if (!curTask) {
      return;
    }
    if (!curTask.isExecuted) {
      console.log(`执行任务 ${curTask.name}`);
      // 任务执行函数是需要外部来提供的
      const addChildTask: ITaskFuncContext<string>["addChildTask"] = (args) => {
        console.log(`添加任务: ${args.type} ${args.name}`);
        const task = createTask({
          ...args,
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
    this.gotoNextTask();
  }
}
