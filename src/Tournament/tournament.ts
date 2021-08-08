import { RESULT_POINT_DICT, RESULT_TYPES } from "./constant";
import {
  TeamResultCounts,
  CompetitionResultType,
  TeamCompetitionResultTableDict,
  TeamCompetitionResultRecord,
  ICompetitionResultRecord,
} from "./interface";

const addResultCount = (
  aStatus: TeamResultCounts,
  bStatus: TeamResultCounts,
  result: CompetitionResultType
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
  records: ReadonlyArray<ICompetitionResultRecord>
): TeamCompetitionResultRecord[] => {
  const dict: TeamCompetitionResultTableDict = new Map();

  // 记录各个球队的比赛结果计数
  records.forEach((record) =>
    addResultCount(
      getTeamTable(dict, record.nameA),
      getTeamTable(dict, record.nameB),
      record.result
    )
  );

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
