import { parseTournamentInputFile, TournamentTable } from "./io";
import { tournament } from "./tournament";

const txt = `
Allegoric Alaskans;Blithering Badgers;win
Devastating Donkeys;Courageous Californians;draw
Devastating Donkeys;Allegoric Alaskans;win


Courageous Californians;Blithering Badgers;loss
    Blithering Badgers;Devastating Donkeys;loss
Allegoric Alaskans;Courageous Californians;win  


Courageous Californians;Blithering Badgers;shengli


Courageous Californians;Blithering Badgers;shibai
`;

const records = parseTournamentInputFile(txt);
const dataSource = tournament(records);
console.log(TournamentTable({ dataSource }));
