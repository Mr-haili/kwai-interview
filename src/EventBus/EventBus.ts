import { createTask, TaskProcess } from "./TaskProcess";
import { TaskFunc, ITask } from "./TaskProcess/interface";
import { EventBus } from "./interface";

type CallbacksMap = Map<string, Set<Function>>;

/**
 * TODO: 写这个函数的时候，思路已经有点混乱了
 */
const createEventTaskFn = (
  callbacksMap: CallbacksMap,
  evtName: string,
  payload: any
): TaskFunc => {
  const callbacks = Array.from(callbacksMap.get(evtName) || []);
  const taskFunc: TaskFunc = async ({ addChildTask }) => {
    callbacks.forEach((callback) => {
      // TODO: 保证 callback 的上下文是当前的 evtBus
      addChildTask(callback.name, async (ctx) => {
        const childEventTrigger = (evtName: string, payload: any) => {
          const innerTaskFunc = createEventTaskFn(
            callbacksMap,
            evtName,
            payload
          );
          ctx.addChildTask(evtName, innerTaskFunc);
        };
        await callback.call(
          {
            trigger: childEventTrigger,
          },
          payload
        );
      });
    });
  };
  return taskFunc;
};

/**
 * 通过 event，创建对应的任务
 */
const createEventTask = (
  callbacksMap: CallbacksMap,
  evtName: string,
  payload: any
) => {
  const taskFunc = createEventTaskFn(callbacksMap, evtName, payload);
  const eventTask: ITask = createTask({
    func: taskFunc,
    name: evtName,
    parent: null,
  });
  return eventTask;
};

const createEventBus = <T extends object>(): EventBus<T> => {
  const callbacksMap: CallbacksMap = new Map();
  const taskProcessMap = new Map<number, TaskProcess>();

  const evtBus = Object.create(null);

  // 用于触发独立的任务进程
  const taskProcessTrigger = (evtName: string, payload: any): void => {
    console.log("taskProcessTrigger", evtName, payload);
    const eventTask = createEventTask(callbacksMap, evtName, payload);
    const taskProcess = new TaskProcess(eventTask);
    taskProcessMap.set(taskProcess.processId, taskProcess);
    const taskProcessFunc = async () => {
      while (!taskProcess.checkRootTaskComplete()) {
        await taskProcess.step();
      }
    };
    taskProcessFunc();
  };

  const listen = (evtName: string, callback: Function): void => {
    if (!callbacksMap.has(evtName)) {
      callbacksMap.set(evtName, new Set());
    }
    callbacksMap.get(evtName)?.add(callback);
  };

  evtBus.trigger = taskProcessTrigger;
  evtBus.listen = listen;

  return evtBus;
};

const evtBus = createEventBus<{
  click: number | string;
  scroll: { pos: number; time: number };
}>();

evtBus.listen("click", function (payload) {
  console.log(`listen click 1`, payload);
  this.trigger("scroll", {
    pos: 1,
    time: 2,
  });
});
evtBus.listen("click", (payload) => {
  console.log(`listen click 2`, payload);
});
evtBus.listen("scroll", (payload) => {
  console.log(`listen 1`, payload);
});

evtBus.trigger("click", 666);
evtBus.trigger("click", "走进科学");
