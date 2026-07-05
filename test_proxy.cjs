const fetch = require('node-fetch'); // wait, fetch is global in node 18+
async function run() {
  const res = await fetch('https://pipedapi.kavin.rocks/streams/5JKQpqwC4oU');
  const data = await res.json();
  console.log("kavin.rocks:", !!data.audioStreams);

  const res2 = await fetch('https://pipedapi.tokhmi.xyz/streams/5JKQpqwC4oU');
  const data2 = await res2.json();
  console.log("tokhmi.xyz:", !!data2.audioStreams);
}
run().catch(console.error);
