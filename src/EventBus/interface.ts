import { TaskProcess } from "./TaskProcess";
import { ITask } from "./TaskProcess/interface";

export type EventBusTaskType = "event" | "callback";

export type EventTask = ITask<"event">;

export type CallbackTask = ITask<"callback">;

export type EventBus<T extends object> = {
  trigger: <TEvtName extends keyof T>(
    evtName: TEvtName,
    payload: T[TEvtName]
  ) => void;
  listen: <TEvtName extends keyof T>(
    evtName: TEvtName,
    callback: (this: Pick<EventBus<T>, "trigger">, payload: T[TEvtName]) => void
  ) => void;
  taskProcessMap: Map<number, TaskProcess>;
};
