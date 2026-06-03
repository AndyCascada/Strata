import { runDailyAnalysis } from "../lib/analyze";
import { yesterday } from "../lib/dates";

const date = process.argv[2] ?? yesterday();

console.log(`Running analysis for ${date}...`);

runDailyAnalysis(date)
  .then((count) => {
    console.log(`Done — analyzed ${count} headlines for ${date}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Analysis failed:", err);
    process.exit(1);
  });
