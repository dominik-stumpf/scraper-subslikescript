import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { outputDir } from './constants';

export async function downloadSeriesTranscript(series: URL, html?: string) {
  let _html = html;
  if (!_html) {
    const response = await fetch(series);
    _html = await response.text();
  }

  const absoluteEpisodeLinks = await getAbsoluteEpisodeLinks(_html, series);
  for (const link of absoluteEpisodeLinks) {
    const transcript = await getTranscriptFromUrl(link);
    writeScriptToFile(transcript, link);
  }
}

function writeScriptToFile(transcript: string, label: URL) {
  const [seriesName, season, episode] = label.pathname.split('/').slice(-3);
  const targetDir = resolve(outputDir, seriesName);
  const seasonDir = resolve(targetDir, season);
  const targetFile = resolve(seasonDir, episode);

  if (!existsSync(seasonDir)) {
    mkdirSync(seasonDir, { recursive: true });
  }

  writeFileSync(targetFile, transcript);
}

async function getTranscriptFromUrl(episode: URL): Promise<string> {
  const $ = load(await (await fetch(episode)).text());

  const script = $('.full-script');
  script.find('br').replaceWith('\n');

  return script.text().trim();
}

async function getAbsoluteEpisodeLinks(
  html: string,
  series: URL,
): Promise<URL[]> {
  const $ = load(html);

  const absoluteEpisodeLinks: URL[] = [];
  $('.series_seasons a[href]').each((i, elem) => {
    const relativeHref = $(elem).attr('href') as string;
    absoluteEpisodeLinks[i] = new URL(relativeHref, series.origin);
  });

  return absoluteEpisodeLinks;
}
