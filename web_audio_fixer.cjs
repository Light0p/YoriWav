const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexToRemoveOldEffect = /\/\/ Audio player effect\s*useEffect\(\(\) => \{[\s\S]*?return \(\) => \{\s*audio\.pause\(\);\s*\};\s*\}, \[\]\);/;

const newAudioLogic = `// Web Audio API & Player Effect
  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3000;

      const master = ctx.createGain();

      // Chain: Source -> Bass -> Mid -> Treble -> Master -> Destination
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(master);
      master.connect(ctx.destination);

      eqNodesRef.current = { bass, mid, treble, master };
    } catch (err) {
      console.error("Web Audio API Init Error:", err);
    }
  }, []); // Run once after mount when ref is populated

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    
    // If we are host of a room, push progress state occasionally to reduce RTDB writes
    if (activeRoomId && isHost && Math.floor(audioRef.current.currentTime) % 2 === 0) {
      import("firebase/firestore").then(({ updateDoc, doc }) => {
        updateDoc(doc(db, "rooms", activeRoomId), { 
          position: audioRef.current?.currentTime || 0,
          updatedAt: Date.now() 
        });
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 372);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };`;

if (!regexToRemoveOldEffect.test(code)) {
    console.error("Could not find the old effect to remove. Here is a snippet around line 144:");
    const lines = code.split('\n');
    console.log(lines.slice(140, 160).join('\n'));
    process.exit(1);
}

code = code.replace(regexToRemoveOldEffect, newAudioLogic);

const finalMain = `        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <audio 
          ref={audioRef} 
          crossOrigin="anonymous" 
          src={currentTrack?.audioUrl || ""}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />
      </main>`;

code = code.replace(/<BottomNav currentTab=\{currentTab\} setCurrentTab=\{setCurrentTab\} \/>\s*<\/main>/, finalMain);

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
