import { EventBus, EventTask } from "./interface";
import { createTask, TaskProcess } from "./TaskProcess";
import { TaskFunc } from "./TaskProcess/interface";
import { printTaskProcessCallStack } from "./TaskProcess/utils";

type CallbacksMap = Map<string, Set<Function>>;

/**
 * TODO: 写这个函数的时候状态不太好
 */
const createEventTaskFn = (
  callbacksMap: CallbacksMap,
  evtName: string,
  payload: any
): TaskFunc => {
  const callbacks = Array.from(callbacksMap.get(evtName) || []);
  const taskFunc: TaskFunc = async ({ addChildTask }) => {
    callbacks.forEach((callback) => {
      addChildTask({
        type: "callback",
        name: callback.name,
        func: async (ctx) => {
          const childEventTrigger = (evtName: string, payload: any) => {
            // console.log("触发子任务", evtName);
            ctx.addChildTask(createEventTask(callbacksMap, evtName, payload));
          };

          // 保证 callback 的 this 上有 trigger 方法
          await callback.call(
            {
              trigger: childEventTrigger,
            },
            payload
          );
        },
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
  const eventTask: EventTask = createTask({
    type: "event",
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
  evtBus.taskProcessMap = taskProcessMap;

  return evtBus;
};

const evtBus = createEventBus<{
  click: number | string;
  scroll: { pos: number; time: number };
}>();

evtBus.listen("click", async function clickListen1(payload) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`callback click1`, payload);
      this.trigger("scroll", {
        pos: 1,
        time: 2,
      });
      resolve();
    }, 200);
  });
});

evtBus.listen("click", async function clickListen2(payload) {
  console.log(`callback click2`, payload);
});

evtBus.listen("scroll", async function clickScroll1(payload) {
  console.log(`callback scroll1`, payload);
  printTaskProcessCallStack(evtBus.taskProcessMap.values().next().value);
});

evtBus.trigger("click", 666);
// evtBus.trigger("click", "走进科学");
