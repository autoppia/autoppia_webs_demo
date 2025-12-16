"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Send, MessageSquare, User, FileText, CheckCircle2, Sparkles, Film, Search } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    logEvent(EVENT_TYPES.CONTACT, {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setStatus("sent");
    setName("");
    setEmail("");
    setMessage("");
    setSubject("");
  };

  const contactReasons = [
    {
      icon: <Search className="h-5 w-5" />,
      text: "Can't find a specific movie?",
    },
    {
      icon: <Film className="h-5 w-5" />,
      text: "Suggest a movie to add",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      text: "Report an issue or bug",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: "Share feedback or ideas",
    },
  ];

  return (
    <section className="space-y-12">
      {/* Hero Section */}
      <div className="relative text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
            <Mail className="h-5 w-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            We'd Love to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-yellow-400 to-secondary">
              Hear From You
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to share your thoughts about our movie search engine? 
            Drop us a line and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Reasons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contactReasons.map((reason, index) => (
          <div
            key={index}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20 mb-3 group-hover:bg-secondary/30 transition-colors">
              <div className="text-secondary">{reason.icon}</div>
            </div>
            <p className="text-sm text-white/80 font-medium text-center">{reason.text}</p>
          </div>
        ))}
      </div>

      {/* Main Contact Form */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-3xl" />
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left Side - Info */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-4">
                  <MessageSquare className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold text-secondary">Contact Us</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Let's Talk About
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
                    Movies
                  </span>
                </h2>
                <p className="text-lg text-white/70 leading-relaxed">
                  Whether you're looking for a specific film, have suggestions for improving our search engine, 
                  or want to report something, we're here to help. Your feedback helps us make the movie discovery 
                  experience even better.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Quick Response</h3>
                    <p className="text-sm text-white/70">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 flex-shrink-0">
                    <Film className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Movie Experts</h3>
                    <p className="text-sm text-white/70">
                      Our team knows movies inside and out
                    </p>
                  </div>
                </div>
              </div>

              {status === "sent" && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-200 mb-1">Message Sent!</p>
                      <p className="text-sm text-emerald-200/80">
                        Thanks for reaching out. We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Form */}
            <div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <User className="h-4 w-4 text-secondary" />
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <Mail className="h-4 w-4 text-secondary" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <FileText className="h-4 w-4 text-secondary" />
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <MessageSquare className="h-4 w-4 text-secondary" />
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full h-32 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all resize-none"
                    placeholder="Tell us what's on your mind..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
