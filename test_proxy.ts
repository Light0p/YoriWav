async function run() {
  try {
    const res = await fetch('https://invidious.jing.rocks/api/v1/videos/5JKQpqwC4oU');
    const data = await res.json();
    console.log("jing.rocks:", !!data.adaptiveFormats);
  } catch(e) {
    console.log("jing.rocks:", e.message);
  }
}
run().catch(console.error);
