const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexOldRefs = /const audioCtxRef = useRef<AudioContext \| null>\(null\);[\s\S]*?const audioRef = useRef<HTMLAudioElement \| null>\(null\);/;

const newRefs = `const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<{bass: BiquadFilterNode|null, mid: BiquadFilterNode|null, treble: BiquadFilterNode|null, master: GainNode|null}>({ bass: null, mid: null, treble: null, master: null });

  useEffect(() => {
    if (eqNodesRef.current.bass) eqNodesRef.current.bass.gain.value = mixerChannels.bass;
    if (eqNodesRef.current.mid) eqNodesRef.current.mid.gain.value = mixerChannels.mid;
    if (eqNodesRef.current.treble) eqNodesRef.current.treble.gain.value = mixerChannels.treble;
  }, [mixerChannels.bass, mixerChannels.mid, mixerChannels.treble]);`;

code = code.replace(regexOldRefs, newRefs);

fs.writeFileSync('src/App.tsx', code);
