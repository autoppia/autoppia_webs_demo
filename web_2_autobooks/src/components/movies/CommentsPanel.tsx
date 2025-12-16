import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MessageSquare, User, Send } from "lucide-react";

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
  const [author, setAuthor] = useState("Anon reader");
  const [message, setMessage] = useState("");

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-bold">Reader Notes</h2>
            <span className="text-sm text-white/60">({comments.length})</span>
          </div>
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-white/30" />
              <p className="text-white/60">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article key={comment.id} className="flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-sm transition-all hover:border-white/20">
                  <img src={comment.avatar} alt="Avatar" className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-secondary/30 object-cover shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{comment.author}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold uppercase tracking-wider">
                        {comment.mood}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed mb-2">{comment.message}</p>
                    <p className="text-xs text-white/40">{comment.createdAt}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <form
          className="lg:w-96"
          onSubmit={(event) => {
            event.preventDefault();
            if (!message.trim()) return;
            onSubmit({ author, message });
            setMessage("");
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Add a Note
            </h3>
            <p className="text-sm text-white/60 mb-6">Share your thoughts about this book. Comments are stored only in memory for demo purposes.</p>
            <label className="block mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                <User className="h-4 w-4 text-secondary" />
                Name
              </div>
              <Input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="Your name"
              />
            </label>
            <label className="block mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                <MessageSquare className="h-4 w-4 text-secondary" />
                Comment
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full h-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                placeholder="Share your thoughts..."
              />
            </label>
            <Button 
              type="submit" 
              className="w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105"
            >
              <Send className="h-5 w-5 mr-2" />
              Share Feedback
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
