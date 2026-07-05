const fs = require('fs');
let code = fs.readFileSync('src/components/RoomView.tsx', 'utf8');

// Find the index of '{/* Right Column Container */}'
const idx = code.indexOf('{/* Right Column Container */}');
if (idx > -1) {
  const newTail = `{/* Right Column Container */}
      <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-4 lg:gap-8 order-1 lg:order-2 h-[500px] md:h-full">
        {/* Avatars (order-1 on mobile) */}
        <div className="w-full md:w-1/3 lg:w-1/3 order-1 h-1/3 md:h-full">
          <div className="border-[1.5px] border-brand-fg bg-brand-surface p-4 h-full overflow-y-auto">
            <h3 className="font-mono text-xs uppercase tracking-widest text-brand-fg mb-4 flex items-center gap-2 font-bold">
              <Users className="w-4 h-4" />
              Active Presence ({members.length})
            </h3>
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div 
                  key={member.uid}
                  className="flex items-center gap-3 border-[1.5px] border-brand-fg p-2 bg-white"
                >
                  <div className="w-6 h-6 border border-brand-fg overflow-hidden jewel-case bg-brand-surface shrink-0">
                    <img 
                      src={member.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlCdtrBmuwOi73Fou1lgM2_B5_3y47mYlYc9n8IUKFbMHFSjtChgbhSjwqVO---m2sueCG0QMmDzmFGrNA5lLfXCXm0X-Qm-uGmhSYxDdTacvpGQaoGYHE-s4qv8jY--fNiXuzAu6iJcfnRoHKr3C2asO4pq3AsWlIhZr6kFhrUiWCFnUodd5LQzmZtvBDRPabkD2JSE-RFos6YBbPd9ZUbeGBEHTlzlfElddnLp_7YCgEonj88Etw"} 
                      alt={member.displayName}
                      className="w-full h-full object-cover filter grayscale"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold truncate leading-none">
                      {member.displayName}
                    </p>
                    <span className="font-mono text-[9px] text-brand-muted uppercase">
                      {member.uid === roomState?.hostId ? "HOST" : "PEER"}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-green-700 rounded-none animate-pulse shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Terminal (order-3 on mobile) */}
        <div className="w-full md:w-2/3 lg:w-2/3 order-3 md:order-2 h-2/3 md:h-full">
          <div className="border-[1.5px] border-brand-fg bg-white flex flex-col justify-between h-full shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="border-b-[1.5px] border-brand-fg bg-brand-surface p-2 lg:p-3 flex justify-between items-center font-mono text-[9px] lg:text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-brand-fg animate-pulse" />
                <span>CHANNEL_ID: ROOM_TRANSCEIVER</span>
              </div>
              <span className="text-brand-muted">STABLE_CONNECT</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="border border-brand-fg/20 bg-brand-surface/30 p-2 text-center font-mono text-[10px] text-brand-muted">
                *** LINK ESTABLISHED ON SECURE FREQUENCY ***
              </div>
              {messages.map((msg, idx) => {
                const isSelf = msg.uid === currentUser?.uid;
                return (
                  <div 
                    key={msg.messageId || idx}
                    className={\`flex flex-col max-w-[85%] \${isSelf ? 'self-end items-end' : 'self-start items-start'}\`}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-brand-muted mb-1">
                      <span className="font-bold">{msg.displayName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <div className={\`p-2.5 font-mono text-xs border-[1.5px] border-brand-fg \${
                      isSelf 
                        ? 'bg-[#E6E0D5] text-brand-fg' 
                        : 'bg-brand-surface text-brand-fg'
                    }\`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t-[1.5px] border-brand-fg bg-brand-surface p-3 shrink-0">
              <div className="flex flex-wrap gap-1.5 mb-3 font-mono text-[9px] uppercase">
                {quickReactions.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => onSendMessage(sticker)}
                    className="border-[1.5px] border-brand-fg bg-white px-2 py-0.5 hover:bg-brand-fg hover:text-brand-bg transition-colors font-bold"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Inject statement into room terminal..."
                  className="flex-1 border-[1.5px] border-brand-fg bg-white py-2 px-3 font-mono text-xs focus:outline-none focus:bg-brand-bg/10 min-w-0"
                />
                <button 
                  type="submit"
                  className="btn-brutalist bg-brand-fg text-brand-bg px-4 py-2 font-mono text-xs font-bold flex items-center justify-center hover:bg-brand-fg/90 shrink-0"
                  title="Transmit message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
  code = code.substring(0, idx) + newTail;
  fs.writeFileSync('src/components/RoomView.tsx', code);
}
