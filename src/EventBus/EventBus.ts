import { EventBus } from "./interface";

const createEventBus = <T extends object>(): EventBus<T> => {
  const callbacksMap = new Map<string, Set<Function>>();

  const trigger = (evtName: string, payload: any): void => {
    const callbacks = callbacksMap.get(evtName)?.values();
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      callback(payload);
    }
  };

  const listen = (evtName: string, callback: Function): void => {
    if (!callbacksMap.has(evtName)) {
      callbacksMap.set(evtName, new Set());
    }
    callbacksMap.get(evtName)?.add(callback);
  };

  const evtBus = {
    trigger,
    listen,
  } as any;
  return evtBus;
};

const evtBus = createEventBus<{
  click: number;
  scroll: { pos: number; time: number };
}>();

evtBus.listen("click", (payload) => {
  console.log(`listen click 1`, payload);
});

evtBus.listen("click", (payload) => {
  console.log(`listen click 2`, payload);
});

evtBus.trigger("click", 666);
