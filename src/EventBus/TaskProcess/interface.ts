interface ITaskFuncContext {
  addChildTask: (name: string, fn: TaskFunc) => void;
}

export type TaskFunc = (ctx: ITaskFuncContext) => Promise<void>;

export type TaskStatus = "executing" | "toBeStarted" | "finish";

export interface ITask<> {
  /**
   * 任务名
   */
  name: string;
  timestamps: {
    /**
     * 任务开始时间
     */
    begin: number;
    /**
     * 任务结束时间
     */
    end: number;
  };
  func: TaskFunc;
  /**
   * TODO: 感觉这个状态和下面有点重复
   */
  status: TaskStatus;
  /**
   * 是否已经执行过
   */
  isExecuted: boolean;
  parent: ITask | null;
  /**
   * 用于记录子任务有多少已经完成
   */
  childTaskOffset: number;
  children: ITask[];
}
