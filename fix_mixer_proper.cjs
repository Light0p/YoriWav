const fs = require('fs');
let code = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

const parts = code.split('export function MixerView() {');

const before = parts[0];

const newMixer = `interface MixerViewProps {
  channels: { bass: number; mid: number; treble: number; gain: number };
  onChannelChange: (channel: string, value: number) => void;
}

export function MixerView({ channels, onChannelChange }: MixerViewProps) {
  const handleChannelChange = (channel: string, value: number) => {
    onChannelChange(channel, value);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Console Mixer</h2>
        <span className="font-mono text-[10px] text-brand-muted">ACTIVE EQUALIZATION BOARD</span>
      </div>

      <div className="border-[1.5px] border-brand-fg bg-[#EDE8DF] p-6 shadow-[4px_4px_0_0_#0D0D0D]">
        
        {/* Console chassis wrapper */}
        <div className="border-[1.5px] border-brand-fg bg-[#DFD9CE] p-6 relative flex flex-col md:flex-row justify-around gap-12">
          
          {/* Channel Fader 1 - Bass */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">01_BASS</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.bass}
                onChange={(e) => handleChannelChange("bass", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.bass > 0 ? '+' : ''}{channels.bass.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 2 - Mid */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">02_MID</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.mid}
                onChange={(e) => handleChannelChange("mid", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.mid > 0 ? '+' : ''}{channels.mid.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 3 - Treble */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">03_TREB</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.treble}
                onChange={(e) => handleChannelChange("treble", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.treble > 0 ? '+' : ''}{channels.treble.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 4 - Master Gain */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-error font-bold tracking-widest border-b border-brand-error/20 pb-1 mb-6">MASTER_GAIN</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-error">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono text-brand-error font-bold">CLIP</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.gain}
                onChange={(e) => handleChannelChange("gain", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-error"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-brand-error text-white border border-brand-error px-1.5 py-0.5">
              {channels.gain > 0 ? '+' : ''}{channels.gain.toFixed(1)} dB
            </span>
          </div>
        </div>

        {/* Master details log */}
        <div className="mt-6 flex gap-3 font-mono text-[10px] text-brand-muted">
          <Info className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
          <span>CHANNEL DEVIATIONS AUTOMATICALLY CONFORMED TO SOUND HELIX STANDARDS. FREQUENCY ENHANCEMENTS ARE CLIENT-SIDE ONLY.</span>
        </div>
      </div>
    </div>
  );
}
`;

// There is another view RoomsListView after MixerView in my fix scripts... wait!
// Let's check what comes after MixerView.
