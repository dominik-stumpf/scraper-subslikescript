import chalk from 'chalk';
import { outputDir, pageOrigin } from './constants';
import { downloadSeriesTranscript } from './lib';

const exampleRequest = new URL('/series/Spartacus-1442449', pageOrigin.origin);

process.stdout.write('Enter series from url: ');
for await (const line of console) {
  const requestUrl = new URL(line, pageOrigin);
  const response = await fetch(requestUrl);

  if (response.ok) {
    console.log(chalk.green(`Initiating download from ${requestUrl.href}`));
    await downloadSeriesTranscript(requestUrl, await response.text());
    console.log(chalk.green(`Downloaded files to ${outputDir}, closing`));
    break;
  }
  console.log(chalk.red('Invalid request. Parsed:', requestUrl.href));
  process.stdout.write(`Enter series from url (e.g. ${exampleRequest}): `);
}
