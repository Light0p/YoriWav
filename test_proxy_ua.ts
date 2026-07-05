async function run() {
  try {
    const res = await fetch('https://pipedapi.tokhmi.xyz/streams/5JKQpqwC4oU', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    const data = await res.json();
    console.log("tokhmi.xyz:", !!data.audioStreams);
  } catch(e) {
    console.log("tokhmi.xyz:", e.message);
  }
}
run().catch(console.error);
