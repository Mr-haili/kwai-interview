import { EventBus, EventTask } from "./interface";
import { createTask, TaskProcess } from "./TaskProcess";
import { TaskFunc } from "./TaskProcess/interface";

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
      addChildTask({
        type: "callback",
        name: callback.name,
        func: async (ctx) => {
          const childEventTrigger = (evtName: string, payload: any) => {
            console.log("触发子任务", evtName);
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

evtBus.listen("click", async function clickListen1(payload) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`\ncallback click1`, payload, "\n");
      this.trigger("scroll", {
        pos: 1,
        time: 2,
      });
      resolve();
    }, 2000);
  });
});
evtBus.listen("click", async function clickListen2(payload) {
  console.log(`\ncallback click2`, payload, "\n");
});

evtBus.listen("scroll", async function clickScroll1(payload) {
  console.log(`\ncallback scroll1`, payload, "\n");
});

evtBus.trigger("click", 666);
// evtBus.trigger("click", "走进科学");
