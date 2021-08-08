import { CompetitionResultType } from "./interface";

export const RESULT_POINT_DICT = (<
  TDict extends { [key in CompetitionResultType]: number }
>(
  dict: TDict
): TDict => dict)({
  draw: 1,
  loss: 0,
  win: 3,
} as const);

export const RESULT_TYPES = (<T extends ReadonlyArray<CompetitionResultType>>(
  a: T
): T => a)(["draw", "loss", "win"] as const);
