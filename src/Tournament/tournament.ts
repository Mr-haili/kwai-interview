type Dict<TKey extends string, TVal> = { [key in TKey]: TVal };

const RESULT_TYPES = ["win", "draw", "loss"] as const;

type CompetitionResult = typeof RESULT_TYPES[number];

/**
 * 比赛结果场数记录
 */
type TeamResultCounts = Dict<CompetitionResult, number>;

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

type TeamCompetitionResultTableDict<TName extends string = string> = Map<
  TName,
  TeamCompetitionResultRecord
>;

const RESULT_POINT_DICT = (<
  TDict extends { [key in CompetitionResult]: number }
>(
  dict: TDict
): TDict => dict)({
  draw: 1,
  loss: 0,
  win: 3,
} as const);

const addResultCount = (
  aStatus: TeamResultCounts,
  bStatus: TeamResultCounts,
  result: CompetitionResult
): void => {
  switch (result) {
    case "win":
      aStatus.win += 1;
      bStatus.loss += 1;
      break;
    case "loss":
      aStatus.loss += 1;
      bStatus.win += 1;
      break;
    case "draw":
      aStatus.draw += 1;
      bStatus.draw += 1;
      break;
  }
};

const getTeamTable = (
  dict: TeamCompetitionResultTableDict,
  name: string
): TeamResultCounts => {
  if (!dict.has(name)) {
    dict.set(name, {
      name,
      win: 0,
      loss: 0,
      draw: 0,
      matchesPlayed: 0,
      points: 0,
    });
  }
  return dict.get(name) as TeamCompetitionResultRecord;
};

const calcTeamPoints = (teamStatus: TeamResultCounts): number =>
  RESULT_TYPES.reduce((acc, resultType) => {
    return (acc += RESULT_POINT_DICT[resultType] * teamStatus[resultType]);
  }, 0);

const calcTeamMatchesPlayed = (teamStatus: TeamResultCounts): number =>
  RESULT_TYPES.reduce((acc, resultType) => {
    return acc + teamStatus[resultType];
  }, 0);

export const tournament = (
  lines: ReadonlyArray<string>
): TeamCompetitionResultRecord[] => {
  const dict: TeamCompetitionResultTableDict = new Map();

  // 记录各个球队的比赛结果计数
  for (const line of lines) {
    const [nameA, nameB, result] = line.split(";") as [
      string,
      string,
      CompetitionResult
    ];
    addResultCount(
      getTeamTable(dict, nameA),
      getTeamTable(dict, nameB),
      result
    );
  }

  // 计算各个球队的比赛场数和得分
  dict.forEach((resultItem) => {
    resultItem.matchesPlayed = calcTeamMatchesPlayed(resultItem);
    resultItem.points = calcTeamPoints(resultItem);
  });

  // 按照得分降序与队名排序
  const resultTables = Array.from(dict.values());
  resultTables.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return a.name < b.name ? -1 : 1;
  });
  return resultTables;
};
