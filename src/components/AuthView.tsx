import React, { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";

interface AuthViewProps {
  onSignInWithGoogle: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSignInWithGoogle }) => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const glare = document.querySelector('.jewel-case-glare') as HTMLElement;
      if (glare) {
        glare.style.background = `linear-gradient(${135 + (x * 10)}deg, rgba(255,255,255,${0.3 + (y * 0.2)}) 0%, rgba(255,255,255,0) 60%)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#fdf8f8] text-[#1c1b1b] min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-hanken">
      {/* Background Grains */}
      <div className="fixed inset-0 grain-overlay"></div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-10 pointer-events-none select-none hidden lg:block">
        <h2 className="font-bodoni text-7xl italic">Stereo</h2>
        <p className="font-courier text-xs tracking-widest">HIGH FIDELITY ARCHIVE v2.0</p>
      </div>

      {/* Main Jewel Case Container */}
      <div className="relative z-10 w-full max-w-md bg-[#F1ECE3] beveled-outset shadow-2xl p-1 overflow-hidden">
        <div className="absolute inset-0 jewel-case-glare pointer-events-none"></div>
        
        {/* Content Interior */}
        <div className="p-8 md:p-12 relative flex flex-col items-center">
          
          {/* Branding/Header Section */}
          <header className="w-full mb-10 text-center">
            <div className="mb-2 flex justify-center">
              <div className="beveled-outset bg-black text-white px-3 py-1">
                <span className="font-courier text-[10px] uppercase tracking-tighter">AUTHENTICATION_MODULE</span>
              </div>
            </div>
            <h1 className="font-bodoni text-4xl leading-none tracking-tight mb-2">JOIN THE ECHO</h1>
            <p className="font-courier text-[#444748] text-[10px] uppercase tracking-widest">Digital Curation Protocol</p>
          </header>

          {/* Social Auth: Google */}
          <button 
            onClick={onSignInWithGoogle}
            className="glossy-button beveled-outset w-full flex items-center justify-center gap-3 py-4 px-6 mb-8 hover:bg-[#ebe7e6] transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full border border-[#c4c7c7] overflow-hidden">
              <img 
                className="w-4 h-4" 
                alt="Google logo" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwcoTqrrIHaxbPU8F1yw4qS4iuB_me-cvMkmoA4IrGeJnvEBdZT9Sa4k_zXAjUUj2svvXYz2JfTCYYoEL96lih8kjHINGnHc7mfYpvYs8_yZrSf-rbWnu_ufqXDG8psYDOOjFQD3gWa4UzslyeALD4k_yFRGaAAuYHSxsD-ALdsUHpuuTeyXamSpEjvGXtVU0cyhijYos6lExq7Q0b_2fjYi--eyCMprZw_FaxbZuRyMO-2Q92uD8buQ" 
              />
            </div>
            <span className="font-courier text-xs font-bold">SIGN IN WITH GOOGLE</span>
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 mb-8">
            <div className="pixel-divider flex-grow"></div>
            <span className="font-courier text-xs opacity-50">OR</span>
            <div className="pixel-divider flex-grow"></div>
          </div>

          {/* Manual Form */}
          <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Use Google Sign-In instead"); }}>
            <div>
              <label className="block font-courier text-[10px] mb-2 uppercase opacity-70">Electronic Mail</label>
              <div className="beveled-inset px-3 py-2 flex items-center">
                <Mail className="text-[#444748] w-4 h-4 mr-2" />
                <input 
                  className="bg-transparent border-none focus:outline-none w-full font-courier text-xs uppercase" 
                  placeholder="USER@DOMAIN.COM" 
                  type="email" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-courier text-[10px] uppercase opacity-70">Secure Password</label>
                <a className="font-courier text-[10px] text-black underline hover:opacity-70 transition-opacity" href="#">FORGOT?</a>
              </div>
              <div className="beveled-inset px-3 py-2 flex items-center">
                <Lock className="text-[#444748] w-4 h-4 mr-2" />
                <input 
                  className="bg-transparent border-none focus:outline-none w-full font-courier text-xs" 
                  placeholder="••••••••" 
                  type="password" 
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                className="w-full bg-black text-white font-courier text-xs py-4 beveled-outset hover:brightness-110 active:scale-[0.98] transition-all" 
                type="submit"
              >
                INITIATE SESSION
              </button>
            </div>
          </form>

          {/* Footer Meta */}
          <footer className="mt-12 w-full text-center">
            <p className="font-courier text-[10px] mb-2 text-[#444748]">FIRST TIME VISITOR?</p>
            <a className="font-courier text-[10px] font-bold text-black underline tracking-widest hover:text-[#c9c6c0] transition-colors" href="#">CREATE AN ACCOUNT</a>
          </footer>

          {/* Decorative "Stickers" */}
          <div className="absolute -top-4 -right-4 sticker-rotate bg-[#F43F5E] text-white font-courier text-[10px] px-4 py-1 shadow-lg border-2 border-white select-none pointer-events-none">
            VERIFIED 1998
          </div>
          
          <div className="absolute -bottom-6 -left-6 rotate-12 bg-white beveled-outset p-2 w-20 h-20 shadow-xl hidden md:block select-none pointer-events-none">
            <img 
              className="w-full h-full object-cover" 
              alt="Vintage vinyl record" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGiL7sSyVtgUrP9bQN-hOXEEN7y9sC5o-2BLZKgTsrvD6HY1aHgoEzLOWZXAQUDFI3cFGmW2nz6SNykrRcCZIwLbPPTLV4a-egNBH0UobJdBQ9gbPb4v4eUhyW9X5pQIMpMwiICQtu_2RskiuxAZLd-UmrEIkce_1ra9F0kFN6fCKl0HiedaiQygsV37O7jTINx_gZEu5BS2iG051R1y8AIl8IPyAP1w_5UEU3aP1-2jOd-ZjgkmJkeg" 
            />
          </div>
        </div>

        {/* Progress/Status bar bottom */}
        <div className="bg-[#e6e2dc] px-4 py-1 flex justify-between items-center border-t border-[#D9D3C7]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-courier text-[10px] uppercase">Connection Stable</span>
          </div>
          <span className="font-courier text-[10px] uppercase">ECHO-PLAYER-V2</span>
        </div>
      </div>

      {/* Experimental Layout Ornamentation */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-1 items-end pointer-events-none opacity-40 select-none">
        <div className="w-32 h-[2px] bg-black"></div>
        <div className="w-24 h-[2px] bg-black"></div>
        <div className="w-16 h-[2px] bg-black"></div>
        <p className="font-courier text-[10px] mt-2">© 1998 ECHO INDUSTRIES</p>
      </div>
    </div>
  );
};
