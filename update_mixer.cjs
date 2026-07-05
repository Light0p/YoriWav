const fs = require('fs');

let code = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

const oldMixer = `export function MixerView() {
  const [channels, setChannels] = useState({
    bass: 0.5,
    mid: 0.7,
    treble: 0.6,
    gain: 0.8
  });

  const handleChannelChange = (channel: string, value: number) => {
    setChannels(prev => ({
      ...prev,
      [channel]: value
    }));
  };`;

const newMixer = `interface MixerViewProps {
  channels: { bass: number; mid: number; treble: number; gain: number };
  onChannelChange: (channel: string, value: number) => void;
}

export function MixerView({ channels, onChannelChange }: MixerViewProps) {
  const handleChannelChange = (channel: string, value: number) => {
    onChannelChange(channel, value);
  };`;

code = code.replace(oldMixer, newMixer);

// Also we need to fix the sliders. Bass/Mid/Treble were min=0 max=1. The prompt says range should be -12 to +12.
// Bass
code = code.replace(/<input [\s\S]*?min="0"[\s\S]*?max="1"[\s\S]*?value=\{channels.bass\}[\s\S]*?\/>/, `<input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.bass}
                onChange={(e) => handleChannelChange("bass", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />`);

// Mid
code = code.replace(/<input [\s\S]*?min="0"[\s\S]*?max="1"[\s\S]*?value=\{channels.mid\}[\s\S]*?\/>/, `<input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.mid}
                onChange={(e) => handleChannelChange("mid", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />`);

// Treble
code = code.replace(/<input [\s\S]*?min="0"[\s\S]*?max="1"[\s\S]*?value=\{channels.treble\}[\s\S]*?\/>/, `<input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.treble}
                onChange={(e) => handleChannelChange("treble", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />`);

// Master Gain - the prompt says "and similarly for Mid, Treble, and Master Gain" -> meaning -12 to 12.
code = code.replace(/<input [\s\S]*?min="0"[\s\S]*?max="12"[\s\S]*?value=\{channels.gain \* 10\}[\s\S]*?\/>/, `<input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.gain}
                onChange={(e) => handleChannelChange("gain", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-error"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />`);

// Fix labels
code = code.replace(/\{Math\.round\(channels\.bass \* 100\)\}%/g, '{channels.bass.toFixed(1)} dB');
code = code.replace(/\{Math\.round\(channels\.mid \* 100\)\}%/g, '{channels.mid.toFixed(1)} dB');
code = code.replace(/\{Math\.round\(channels\.treble \* 100\)\}%/g, '{channels.treble.toFixed(1)} dB');
code = code.replace(/\{\(channels\.gain \* 10\)\.toFixed\(1\)\} dB/g, '{channels.gain.toFixed(1)} dB');

fs.writeFileSync('src/components/OtherViews.tsx', code);
