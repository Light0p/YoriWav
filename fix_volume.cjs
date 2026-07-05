const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const volumeEffect = `  // Adjust audio element volume and master gain
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    // Web audio bypasses HTML volume, so apply it to master gain too
    if (eqNodesRef.current.master) {
      const mixerDb = mixerChannels.gain;
      const mixerLinear = Math.pow(10, mixerDb / 20);
      eqNodesRef.current.master.gain.value = mixerLinear * volume;
    }
  }, [volume, mixerChannels.gain]);`;

code = code.replace(/\/\/ Adjust audio element volume[\s\S]*?\}, \[volume\]\);/, volumeEffect);

// And we need to remove the eqNodesRef.current.master update from the [mixerChannels] effect
// to prevent double updates or conflicts.

const oldMixerEffect = `  useEffect(() => {
    if (eqNodesRef.current.bass) eqNodesRef.current.bass.gain.value = mixerChannels.bass;
    if (eqNodesRef.current.mid) eqNodesRef.current.mid.gain.value = mixerChannels.mid;
    if (eqNodesRef.current.treble) eqNodesRef.current.treble.gain.value = mixerChannels.treble;
    if (eqNodesRef.current.master) {
      eqNodesRef.current.master.gain.value = Math.pow(10, mixerChannels.gain / 20);
    }
  }, [mixerChannels]);`;

const newMixerEffect = `  useEffect(() => {
    if (eqNodesRef.current.bass) eqNodesRef.current.bass.gain.value = mixerChannels.bass;
    if (eqNodesRef.current.mid) eqNodesRef.current.mid.gain.value = mixerChannels.mid;
    if (eqNodesRef.current.treble) eqNodesRef.current.treble.gain.value = mixerChannels.treble;
  }, [mixerChannels.bass, mixerChannels.mid, mixerChannels.treble]);`;

code = code.replace(oldMixerEffect, newMixerEffect);

fs.writeFileSync('src/App.tsx', code);
