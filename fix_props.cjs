const fs = require('fs');
let code = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

const propsCode = `
interface RoomsListViewProps {
  activeRooms: RoomModel[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}
`;

code = code.replace(/export function RoomsListView\(/, propsCode + 'export function RoomsListView(');
fs.writeFileSync('src/components/OtherViews.tsx', code);
