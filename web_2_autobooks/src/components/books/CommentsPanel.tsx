import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MessageSquare, User, Send, Pencil, Trash2 } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export interface CommentEntry {
  id: string;
  author: string;
  message: string;
  mood: string;
  avatar: string;
  createdAt: string;
  /** When set, only this session user may edit or delete (matches logged-in username). */
  ownerUsername?: string | null;
}

interface CommentsPanelProps {
  comments: CommentEntry[];
  currentUsername: string | null;
  onSubmit: (payload: { author: string; message: string; ownerUsername: string | null }) => void;
  onUpdateComment: (id: string, message: string) => void;
  onDeleteComment: (id: string) => void;
}

function canManageComment(comment: CommentEntry, currentUsername: string | null): boolean {
  if (!currentUsername || !comment.ownerUsername) {
    return false;
  }
  return comment.ownerUsername === currentUsername;
}

export function CommentsPanel({
  comments,
  currentUsername,
  onSubmit,
  onUpdateComment,
  onDeleteComment,
}: CommentsPanelProps) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState("");
  const dyn = useDynamicSystem();

  const startEdit = (comment: CommentEntry) => {
    setEditingId(comment.id);
    setDraftEdit(comment.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftEdit("");
  };

  const saveEdit = (id: string) => {
    const next = draftEdit.trim();
    if (!next) {
      return;
    }
    onUpdateComment(id, next);
    cancelEdit();
  };

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
                <article
                  key={comment.id}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-sm transition-all hover:border-white/20"
                >
                  <img
                    src={comment.avatar}
                    alt=""
                    className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-secondary/30 object-cover shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{comment.author}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold uppercase tracking-wider">
                        {comment.mood}
                      </span>
                      {canManageComment(comment, currentUsername) ? (
                        <div className="ml-auto flex flex-wrap gap-2">
                          {editingId === comment.id ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                id={dyn.v3.getVariant("comment-save-edit-button", ID_VARIANTS_MAP, "comment-save-edit-button")}
                                className={cn(
                                  "h-8 border-0 bg-secondary text-black hover:bg-secondary/90 text-xs",
                                  dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")
                                )}
                                onClick={() => saveEdit(comment.id)}
                              >
                                {dyn.v3.getVariant("comment_save", TEXT_VARIANTS_MAP, "Save")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 border border-white/15 text-xs text-white/80 hover:bg-white/10"
                                onClick={cancelEdit}
                              >
                                {dyn.v3.getVariant("comment_cancel", TEXT_VARIANTS_MAP, "Cancel")}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                id={dyn.v3.getVariant("comment-edit-button", ID_VARIANTS_MAP, "comment-edit-button")}
                                className="h-8 gap-1 border border-white/15 px-2 text-xs text-white/80 hover:bg-white/10"
                                onClick={() => startEdit(comment)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                {dyn.v3.getVariant("comment_edit", TEXT_VARIANTS_MAP, "Edit")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                id={dyn.v3.getVariant("comment-delete-button", ID_VARIANTS_MAP, "comment-delete-button")}
                                className="h-8 gap-1 border border-red-400/25 px-2 text-xs text-red-200 hover:bg-red-400/10"
                                onClick={() => onDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {dyn.v3.getVariant("comment_delete", TEXT_VARIANTS_MAP, "Delete")}
                              </Button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                    {editingId === comment.id ? (
                      <textarea
                        value={draftEdit}
                        onChange={(e) => setDraftEdit(e.target.value)}
                        className={cn(
                          "mt-2 w-full min-h-[6rem] rounded-2xl border border-white/20 bg-white/10 p-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary",
                          dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
                        )}
                        id={dyn.v3.getVariant("comment-edit-textarea", ID_VARIANTS_MAP, "comment-edit-textarea")}
                      />
                    ) : (
                      <p className="text-sm text-white/80 leading-relaxed mb-2">{comment.message}</p>
                    )}
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
            onSubmit({
              author,
              message,
              ownerUsername: currentUsername,
            });
            setMessage("");
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              Add a Note
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Share your thoughts about this book. Comments are stored only in memory for demo purposes.
            </p>
            {!currentUsername ? (
              <p className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                {dyn.v3.getVariant(
                  "comment_login_hint",
                  TEXT_VARIANTS_MAP,
                  "Sign in to edit or delete notes you post under your account."
                )}
              </p>
            ) : null}
            <label className="block mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                <User className="h-4 w-4 text-secondary" />
                Name
              </div>
              <Input
                id={dyn.v3.getVariant("comment-author-input", ID_VARIANTS_MAP, "comment-author-input")}
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className={cn(
                  "h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                  dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
                )}
                placeholder={dyn.v3.getVariant("name_placeholder", TEXT_VARIANTS_MAP, "Your name")}
              />
            </label>
            <label className="block mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                <MessageSquare className="h-4 w-4 text-secondary" />
                Comment
              </div>
              <textarea
                id={dyn.v3.getVariant("comment-message-textarea", ID_VARIANTS_MAP, "comment-message-textarea")}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={cn(
                  "w-full h-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none",
                  dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
                )}
                placeholder={dyn.v3.getVariant("message_placeholder", TEXT_VARIANTS_MAP, "Tell us what's on your mind...")}
              />
            </label>
            <Button
              type="submit"
              id={dyn.v3.getVariant("share-feedback-button", ID_VARIANTS_MAP, "share-feedback-button")}
              className={cn(
                "w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105",
                dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")
              )}
            >
              <Send className="h-5 w-5 mr-2" />
              {dyn.v3.getVariant("share_feedback", TEXT_VARIANTS_MAP, "Share Feedback")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
