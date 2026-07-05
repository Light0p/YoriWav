const fs = require('fs');

let otherViews = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

const roomsListCode = `
import { Users, Plus } from "lucide-react";
import { RoomModel } from "../types";

interface RoomsListViewProps {
  activeRooms: RoomModel[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

export function RoomsListView({ activeRooms, onJoinRoom, onCreateRoom }: RoomsListViewProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Live Rooms</h2>
        <span className="font-mono text-[10px] text-brand-muted">NETWORKED AUDIO SESSIONS</span>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={onCreateRoom}
          className="w-full border-[1.5px] border-brand-fg bg-brand-fg text-brand-bg py-4 font-mono font-bold text-lg uppercase tracking-widest hover:bg-brand-fg/90 transition-colors shadow-[4px_4px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            CREATE NEW JAM ROOM
          </div>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {activeRooms.length === 0 ? (
            <div className="col-span-full border-[1.5px] border-brand-fg border-dashed p-8 text-center bg-brand-surface/40">
              <span className="font-mono text-sm text-brand-muted">NO ACTIVE ROOMS FOUND.</span>
            </div>
          ) : (
            activeRooms.map(room => (
              <div 
                key={room.roomId}
                onClick={() => onJoinRoom(room.roomId)}
                className="border-[1.5px] border-brand-fg bg-white p-4 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#0D0D0D] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold underline decoration-2 truncate max-w-[150px]">
                      {room.roomId.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] bg-brand-fg text-brand-bg px-1 font-bold">
                      <Users className="w-3 h-3" /> LIVE
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-brand-muted mb-4">
                    Host: {room.hostName}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-brand-fg flex-shrink-0 bg-brand-surface overflow-hidden">
                    <img src={room.trackThumbnailUrl} alt="" className="w-full h-full object-cover filter grayscale" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-xs font-bold truncate">{room.trackTitle}</p>
                    <p className="font-mono text-[9px] text-brand-muted truncate">{room.trackArtist}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`;

otherViews = otherViews.replace('import { TrackModel } from "../types";', 'import { TrackModel, RoomModel } from "../types";\nimport { Users, Plus } from "lucide-react";');
otherViews += roomsListCode;

fs.writeFileSync('src/components/OtherViews.tsx', otherViews);
