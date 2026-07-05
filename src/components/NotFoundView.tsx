/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function NotFoundView() {
  return (
    <div className="w-full max-w-md mx-auto my-12 border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] flex flex-col gap-6 text-black font-mono relative overflow-hidden">
      <div className="halftone-overlay absolute inset-0 opacity-5 pointer-events-none" />
      <h1 className="font-serif text-4xl font-bold uppercase border-b-4 border-black pb-3 select-none">
        404 // NOT FOUND
      </h1>
      <p className="text-sm font-bold uppercase select-none">
        THE REQUESTED RESOURCE IS OUT OF RANGE OR DOES NOT EXIST.
      </p>
      <div className="bg-[#f4f4f0] border-2 border-black p-4 text-xs font-bold leading-normal uppercase select-all">
        STATUS: ERR_SYSTEM_404_PAGE_NOT_FOUND
        <br />
        SECTOR: DESKTOP_BROADCAST_ROUTER
        <br />
        SYSTEM: DEPLOY_VERCEL_STATIC
      </div>
      <a 
        href="/"
        className="w-full py-4 border-2 border-black bg-black text-white text-center font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer select-none"
      >
        [ RETURN TO DECK ]
      </a>
    </div>
  );
}
