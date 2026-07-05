const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. We replace the top Web Audio refs with the requested refs.
const oldRefsAndMixerState = `  const [mixerChannels, setMixerChannels] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    gain: 0, // 0 dB
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (bassFilterRef.current) bassFilterRef.current.gain.value = mixerChannels.bass;
    if (midFilterRef.current) midFilterRef.current.gain.value = mixerChannels.mid;
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = mixerChannels.treble;
    if (masterGainRef.current) {
      // Convert dB to linear amplitude
      // For Master Gain, if it's -12 to +12, we can just use Math.pow(10, db/20)
      masterGainRef.current.gain.value = Math.pow(10, mixerChannels.gain / 20);
    }
  }, [mixerChannels]);

  const audioRef = useRef<HTMLAudioElement | null>(null);`;

const newRefsAndMixerState = `  const [mixerChannels, setMixerChannels] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    gain: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<{bass: BiquadFilterNode|null, mid: BiquadFilterNode|null, treble: BiquadFilterNode|null, master: GainNode|null}>({ bass: null, mid: null, treble: null, master: null });

  useEffect(() => {
    if (eqNodesRef.current.bass) eqNodesRef.current.bass.gain.value = mixerChannels.bass;
    if (eqNodesRef.current.mid) eqNodesRef.current.mid.gain.value = mixerChannels.mid;
    if (eqNodesRef.current.treble) eqNodesRef.current.treble.gain.value = mixerChannels.treble;
    if (eqNodesRef.current.master) {
      eqNodesRef.current.master.gain.value = Math.pow(10, mixerChannels.gain / 20);
    }
  }, [mixerChannels]);`;

code = code.replace(oldRefsAndMixerState, newRefsAndMixerState);

// 2. We replace the entire audio effect with the new Web Audio setup
// Wait, the old audio effect sets up event listeners. Since we'll render an <audio> tag, we can put the event listeners as props, or just bind them in an effect.
// Let's replace the whole effect up to `audio.addEventListener("ended", ...`

const oldEffectMatch = code.match(/useEffect\(\(\) => \{\s*const audio = new Audio\(\);[\s\S]*?setIsPlaying\(false\);\n    \}\);\n\n    return \(\) => \{\n      \/\/ Cleanup\n    \};\n  \}, \[\]\);/);
// Wait, what exactly is the old effect doing? Let's check it.
