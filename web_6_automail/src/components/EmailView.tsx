"use client";
import React from "react";
import { useEffect } from "react";
import { cn } from "@/library/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEmail } from "@/contexts/EmailContext";
import { LabelSelector } from "@/components/LabelSelector";
import { EVENT_TYPES, logEvent } from "@/library/events";
import {
  Star,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  MoreVertical,
  Paperclip,
  Download,
  AlertTriangle,
  ArrowLeft,
  Info,
  Clock,
  Mail,
} from "lucide-react";

export function EmailView() {
  const {
    currentEmail,
    setCurrentEmail,
    toggleStar,
    markAsImportant,
    markAsUnread,
    markAsSpam,
    moveToTrash,
  } = useEmail();

  useEffect(() => {
    if (!currentEmail) return;
    logEvent(EVENT_TYPES.VIEW_EMAIL, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
    });
  }, [currentEmail]);

  if (!currentEmail) {
    return null;
  }

  const handleBack = () => {
    setCurrentEmail(null);
  };

  const handleStarClick = () => {
    toggleStar(currentEmail.id);
    logEvent(EVENT_TYPES.STAR_AN_EMAIL, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
      is_star: !currentEmail.isStarred,
    });
  };

  const handleImportantClick = () => {
    markAsImportant(currentEmail.id, !currentEmail.isImportant);
    logEvent(EVENT_TYPES.MARK_EMAIL_AS_IMPORTANT, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
      is_important: !currentEmail.isImportant,
    });
  };

  const handleDeleteClick = () => {
    moveToTrash([currentEmail.id]);
    setCurrentEmail(null);
    logEvent(EVENT_TYPES.DELETE_EMAIL, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
    });
  };

  const handleMarkAsUnread = () => {
    markAsUnread(currentEmail.id);
    logEvent(EVENT_TYPES.MARK_AS_UNREAD, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
      is_read: false,
    });
  };

  const handleMarkAsSpam = () => {
    markAsSpam([currentEmail.id]);
    setCurrentEmail(null);
    logEvent(EVENT_TYPES.MARK_AS_SPAM, {
      email_id: currentEmail.id,
      subject: currentEmail.subject,
      from: currentEmail.from.email,
      is_spam: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="h-full flex flex-col bg-background"
      suppressHydrationWarning
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 toolbar-glass">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="Archive">
              <Archive className="h-5 w-5" />
            </Button>

            <Button
              id="spam-button"
              variant="ghost"
              size="icon"
              onClick={handleMarkAsSpam}
              title="Mark as spam"
            >
              <Info className="h-5 w-5" />
            </Button>

            <Button
              id="unread-button"
              variant="ghost"
              size="icon"
              onClick={handleMarkAsUnread}
              title="Mark as unread"
            >
              <Mail className="h-5 w-5" />
            </Button>

            <Button
              id="delete-button"
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </Button>

            <div title="Add label">
              <LabelSelector email={currentEmail} />
            </div>

            <Button id="snooze-button" variant="ghost" size="icon" title="Snooze">
              <Clock className="h-5 w-5" />
            </Button>

            <Button
              id="star-button"
              variant="ghost"
              size="icon"
              onClick={handleStarClick}
              title={currentEmail.isStarred ? "Remove star" : "Add star"}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  currentEmail.isStarred && "fill-yellow-400 text-yellow-400"
                )}
              />
            </Button>

            <Button
              id="important-button"
              variant="ghost"
              size="icon"
              onClick={handleImportantClick}
              title={
                currentEmail.isImportant
                  ? "Mark as not important"
                  : "Mark as important"
              }
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  currentEmail.isImportant && "text-yellow-600 fill-yellow-600"
                )}
              />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">1 of 50</span>
          <Button id="more-toolbar-button" variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Email Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Email Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-normal mb-4 leading-normal">
              {currentEmail.subject}
            </h1>

            {/* Labels */}
            {currentEmail.labels.length > 0 && (
              <div className="flex gap-2 mb-4">
                {currentEmail.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: label.color, color: label.color }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sender Information */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {currentEmail.from.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">
                      {currentEmail.from.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      &lt;{currentEmail.from.email}&gt;
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">From:</span>{" "}
                    {currentEmail.from.name} &lt;{currentEmail.from.email}&gt;
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Date:</span>{" "}
                    {currentEmail.timestamp.toLocaleDateString()}{" "}
                    {currentEmail.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Subject:</span>{" "}
                    {currentEmail.subject}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Reply className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* To Recipients */}
            {currentEmail.to.length > 0 && (
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground font-medium">To: </span>
                {currentEmail.to.map((recipient, index) => (
                  <span key={`to-${recipient.email}-${index}`}>
                    {recipient.name} &lt;{recipient.email}&gt;
                    {index < currentEmail.to.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}

            {/* CC Recipients */}
            {currentEmail.cc && currentEmail.cc.length > 0 && (
              <div className="mt-1 text-sm">
                <span className="text-muted-foreground font-medium">CC: </span>
                {currentEmail.cc.map((recipient, index) => (
                  <span key={`cc-${recipient.email}-${index}`}>
                    {recipient.name} &lt;{recipient.email}&gt;
                    {index < (currentEmail.cc?.length || 0) - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Email Body */}
          <div className="mb-8">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {currentEmail.body}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {currentEmail.attachments && currentEmail.attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                {currentEmail.attachments.length} attachment
                {currentEmail.attachments.length !== 1 ? "s" : ""}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {currentEmail.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                      <Paperclip className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button id="reply-button">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button id="reply-all-button" variant="outline">
              <ReplyAll className="h-4 w-4 mr-2" />
              Reply All
            </Button>
            <Button id="forward-button" variant="outline">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
