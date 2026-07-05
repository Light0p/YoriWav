import { Innertube } from 'youtubei.js';

async function main() {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getBasicInfo('5JKQpqwC4oU');
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  console.log("Format url:", format?.url);
}
main().catch(console.error);
