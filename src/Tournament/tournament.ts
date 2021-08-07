type Dict<TKey extends string, TVal> = { [key in TKey]: TVal };

enum CompetitionResult {
  Win = "win",
  Draw = "draw",
  Loss = "loss",
}

/**
 * 比赛结果场数记录
 */
type TeamResultCounts = Dict<CompetitionResult, number>;

/**
 * 球队比赛结果记录
 */
type TeamCompetitionResultTable = TeamResultCounts & {
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
  TeamCompetitionResultTable
>;

const RESULT_POINT_DICT = {
  [CompetitionResult.Win]: 3,
  [CompetitionResult.Draw]: 1,
  [CompetitionResult.Loss]: 0,
} as const;

const RESULT_TYPES = [
  CompetitionResult.Win,
  CompetitionResult.Loss,
  CompetitionResult.Draw,
] as const;

const addResultCount = (
  aStatus: TeamResultCounts,
  bStatus: TeamResultCounts,
  result: CompetitionResult
): void => {
  switch (result) {
    case CompetitionResult.Win:
      aStatus[CompetitionResult.Win] += 1;
      bStatus[CompetitionResult.Loss] += 1;
      break;
    case CompetitionResult.Loss:
      aStatus[CompetitionResult.Loss] += 1;
      bStatus[CompetitionResult.Win] += 1;
      break;
    case CompetitionResult.Draw:
      aStatus[CompetitionResult.Draw] += 1;
      bStatus[CompetitionResult.Draw] += 1;
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
      [CompetitionResult.Win]: 0,
      [CompetitionResult.Loss]: 0,
      [CompetitionResult.Draw]: 0,
      matchesPlayed: 0,
      points: 0,
    });
  }
  return dict.get(name) as TeamCompetitionResultTable;
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
): TeamCompetitionResultTable[] => {
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
