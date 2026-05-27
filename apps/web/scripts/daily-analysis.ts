import { runDailyAnalysis } from "../lib/analyze";

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

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
