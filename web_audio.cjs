const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const webAudioState = `  const [mixerChannels, setMixerChannels] = useState({
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
  }, [mixerChannels]);`;

appCode = appCode.replace(/const audioRef = useRef<HTMLAudioElement \| null>\(null\);/, webAudioState + '\n\n  const audioRef = useRef<HTMLAudioElement | null>(null);');

const webAudioSetup = `    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Web Audio API setup
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass && !audioContextRef.current) {
      try {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        
        const source = ctx.createMediaElementSource(audio);
        
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
        
        source.connect(bass);
        bass.connect(mid);
        mid.connect(treble);
        treble.connect(master);
        master.connect(ctx.destination);
        
        bassFilterRef.current = bass;
        midFilterRef.current = mid;
        trebleFilterRef.current = treble;
        masterGainRef.current = master;
      } catch (err) {
        console.error("Web Audio API failed to initialize", err);
      }
    }`;

appCode = appCode.replace(/const audio = new Audio\(\);\s*audioRef\.current = audio;/, webAudioSetup);

// Pass channels and onChannelChange to MixerView
appCode = appCode.replace(/\{currentTab === "mixer" && <MixerView \/>\}/, `{currentTab === "mixer" && <MixerView channels={mixerChannels} onChannelChange={(ch, val) => setMixerChannels(prev => ({ ...prev, [ch]: val }))} />}`);

fs.writeFileSync('src/App.tsx', appCode);
