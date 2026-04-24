/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flag } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gov-blue text-white py-2 sm:py-3 px-4 sm:px-6 shadow-sm no-print flex justify-between items-center z-50 sticky top-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="font-bold text-base sm:text-lg leading-none truncate max-w-[150px] sm:max-w-none">AsignaCurulComunal</span>
        <span className="text-[10px] sm:text-[12px] opacity-80 border-l border-white/20 pl-2 sm:pl-3 leading-none hidden xs:inline sm:inline">
          v1.2
        </span>
      </div>
      <div className="flex gap-2">
        <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] font-medium backdrop-blur-sm truncate max-w-[120px] sm:max-w-none">
          J.A.C. Centro
        </div>
      </div>
    </header>
  );
}
