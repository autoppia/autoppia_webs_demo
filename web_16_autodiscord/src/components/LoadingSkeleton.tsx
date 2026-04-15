"use client";

export function LoadingSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-discord-darkest">
      <div className="w-[72px] flex-shrink-0 bg-discord-darker flex flex-col items-center py-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-2xl bg-discord-dark animate-pulse"
          />
        ))}
      </div>
      <div className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col">
        <div className="h-12 border-b border-black/20 flex items-center px-4">
          <div className="h-4 w-24 bg-discord-dark rounded animate-pulse" />
        </div>
        <div className="p-2 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-full bg-discord-dark/80 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-discord-channel min-w-0">
        <div className="h-12 border-b border-black/20 flex items-center px-4 gap-2">
          <div className="h-5 w-5 bg-discord-dark rounded animate-pulse" />
          <div className="h-4 w-20 bg-discord-dark rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-discord-darker animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-discord-dark rounded animate-pulse" />
                <div className="h-3 w-full max-w-md bg-discord-dark/80 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col">
        <div className="h-12 border-b border-black/20 flex items-center px-4">
          <div className="h-3 w-20 bg-discord-dark rounded animate-pulse" />
        </div>
        <div className="p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-discord-dark animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-16 bg-discord-dark rounded animate-pulse" />
                <div className="h-2 w-24 bg-discord-dark/80 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
