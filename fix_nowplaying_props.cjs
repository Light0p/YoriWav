const fs = require('fs');
let code = fs.readFileSync('src/components/NowPlayingView.tsx', 'utf8');

const propsRegex = /interface NowPlayingViewProps \{([\s\S]*?)\}/;
const newProps = `interface NowPlayingViewProps {
  currentTrack: TrackModel | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPlayTrack: (track: TrackModel, queue?: TrackModel[]) => void;
  currentTime: number;
  queue: TrackModel[];
  currentTrackIndex: number;
  favorites: TrackModel[];
  onToggleFavorite: (track: TrackModel) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
}`;

code = code.replace(propsRegex, newProps);

const argsRegex = /export default function NowPlayingView\(\{([\s\S]*?)\}: NowPlayingViewProps\) \{/;
const newArgs = `export default function NowPlayingView({
  currentTrack,
  isPlaying,
  onPlayPause,
  onPlayTrack,
  currentTime,
  queue,
  currentTrackIndex,
  favorites,
  onToggleFavorite,
  onSkipNext,
  onSkipPrevious
}: NowPlayingViewProps) {`;

code = code.replace(argsRegex, newArgs);

fs.writeFileSync('src/components/NowPlayingView.tsx', code);
