export type EventBus<T extends object> = {
  trigger: <TEvtName extends keyof T>(
    evtName: TEvtName,
    payload: T[TEvtName]
  ) => void;
  listen: <TEvtName extends keyof T>(
    evtName: TEvtName,
    callback: (payload: T[TEvtName]) => void
  ) => void;
};
