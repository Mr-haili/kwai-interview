import { TableFactory } from "../components/Table";
import {
  CompetitionResultType,
  ICompetitionResultRecord,
  TeamCompetitionResultRecord,
} from "./interface";

/**
 * 根据题意队伍名暂时认为由英语字母 + 空格组成
 */
const TOURNAMENT_FORMAT_PATTERN = /^[A-Za-z\s]+;[A-Za-z\s]+;(win|loss|draw)$/;

/**
 * 如果输入格式非法返回 null
 * 否则会解析后返回结构化的结果
 *
 * @param line
 */
const parseTournamentLine = (line: string): ICompetitionResultRecord | null => {
  if (!TOURNAMENT_FORMAT_PATTERN.test(line)) {
    return null;
  }
  const [nameA, nameB, result] = line.split(";").map((s) => s.trim()) as [
    string,
    string,
    CompetitionResultType
  ];
  const record = {
    nameA,
    nameB,
    result,
  };
  return record;
};

/**
 * 读入比赛结果的原始数据
 */
export const parseTournamentInputFile = (
  txt: string
): ICompetitionResultRecord[] => {
  const lines = txt
    .split(/\n/)
    .map((s) => s.trim())
    .filter((s) => s);
  const records = lines
    .map(parseTournamentLine)
    .filter((v) => v) as ICompetitionResultRecord[];
  return records;
};

export const TournamentTable = TableFactory<TeamCompetitionResultRecord>({
  columns: [
    {
      title: "Team",
      name: "name",
      width: 31,
    },
    {
      title: "MP",
      name: "matchesPlayed",
    },
    {
      title: "W",
      name: "win",
    },
    {
      title: "D",
      name: "draw",
    },
    {
      title: "L",
      name: "loss",
    },
    {
      title: "P",
      name: "points",
    },
  ],
});
