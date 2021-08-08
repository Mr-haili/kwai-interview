import { EventBus } from "./interface";

const createEventBus = <T extends object>(): EventBus<T> => {
  const callbacksMap = new Map<string, Set<Function>>();

  const evtBus = Object.create(null);

  const trigger = (evtName: string, payload: any): void => {
    const callbacks = callbacksMap.get(evtName)?.values();
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      // 保证 callback 的上下文是当前的 evtBus
      callback.call(evtBus, payload);
    }
  };

  const listen = (evtName: string, callback: Function): void => {
    if (!callbacksMap.has(evtName)) {
      callbacksMap.set(evtName, new Set());
    }
    callbacksMap.get(evtName)?.add(callback);
  };

  evtBus.trigger = trigger;
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
