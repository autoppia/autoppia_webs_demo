import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { applyDynamicWrapper, useSeedValue } from "@/components/ui/variants";

export interface CommentEntry {
  id: string;
  author: string;
  message: string;
  mood: string;
  avatar: string;
  createdAt: string;
}

interface CommentsPanelProps {
  comments: CommentEntry[];
  onSubmit: (payload: { author: string; message: string }) => void;
}

export function CommentsPanel({ comments, onSubmit }: CommentsPanelProps) {
  const [author, setAuthor] = useState("Anon cinephile");
  const [message, setMessage] = useState("");
  const seed = useSeedValue();

  return (
    applyDynamicWrapper(seed, "comments-panel",
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-semibold">Community notes</h2>
            {comments.map((comment) => (
              <article key={comment.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:bg-black/50">
                <img
                  src={comment.avatar}
                  alt="Avatar"
                  className="h-12 w-12 rounded-full border border-white/20 object-cover ring-2 ring-white/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{comment.author}</p>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                      {comment.mood}
                    </span>
                  </div>
                  <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm text-white/80">{comment.message}</p>
                  <p className="mt-1 text-xs text-white/40">{comment.createdAt}</p>
                </div>
              </article>
            ))}
          </div>
          <form
            className="lg:w-80"
            onSubmit={(event) => {
              event.preventDefault();
              if (!message.trim()) return;
              onSubmit({ author, message });
              setMessage("");
            }}
          >
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="text-lg font-semibold">Add a note</h3>
              <p className="text-sm text-white/60">Comments are stored locally for demo purposes.</p>
              <label className="mt-4 block text-xs uppercase tracking-wide text-white/60">
                Name
                <Input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="mt-1 bg-black/40 text-white"
                />
              </label>
              <label className="mt-4 block text-xs uppercase tracking-wide text-white/60">
                Comment
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-1 h-32 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </label>
              <Button type="submit" className="mt-4 w-full bg-secondary text-black hover:bg-secondary/80">
                Share feedback
              </Button>
            </div>
          </form>
        </div>
      </section>
    )
  );
}
