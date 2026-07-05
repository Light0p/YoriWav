const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ LibraryView, SearchView, MixerView \} from "\.\/components\/OtherViews";/, 'import { LibraryView, SearchView, MixerView, RoomsListView } from "./components/OtherViews";');

const oldRoomRendering = `{currentTab === "room" && activeRoomId && (
            <RoomView 
              roomId={activeRoomId}
              roomState={roomState}
              members={roomMembers}
              messages={roomMessages}
              onSendMessage={handleSendMessage}
              onLeaveRoom={handleLeaveRoom}
              currentUser={currentUser}
              isHost={isHost}
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
            />
          )}`;

const newRoomRendering = `{currentTab === "room" && (
            activeRoomId ? (
              <RoomView 
                roomId={activeRoomId}
                roomState={roomState}
                members={roomMembers}
                messages={roomMessages}
                onSendMessage={handleSendMessage}
                onLeaveRoom={handleLeaveRoom}
                currentUser={currentUser}
                isHost={isHost}
                onPlayPause={handlePlayPause}
                isPlaying={isPlaying}
              />
            ) : (
              <RoomsListView 
                activeRooms={activeRooms}
                onJoinRoom={handleJoinRoom}
                onCreateRoom={() => {
                  if (currentTrack) {
                    handleCreateRoom(currentTrack);
                  } else {
                    alert("Play a track first to create a room.");
                  }
                }}
              />
            )
          )}`;

code = code.replace(oldRoomRendering, newRoomRendering);

fs.writeFileSync('src/App.tsx', code);
