type Dict<TKey extends string, TVal> = { [key in TKey]: TVal };

export type CompetitionResultType = "win" | "draw" | "loss";

export interface ICompetitionResultRecord {
  nameA: string;
  nameB: string;
  result: CompetitionResultType;
}

/**
 * 比赛结果场数记录
 */
export type TeamResultCounts = Dict<CompetitionResultType, number>;

/**
 * 球队比赛结果记录
 */
export type TeamCompetitionResultRecord = TeamResultCounts & {
  /**
   * 球队名
   */
  name: string;
  /**
   * 总得分
   */
  points: number;
  /**
   * 参与比赛
   */
  matchesPlayed: number;
};

export type TeamCompetitionResultTableDict<TName extends string = string> = Map<
  TName,
  TeamCompetitionResultRecord
>;
