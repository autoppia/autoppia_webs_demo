"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Globe } from "lucide-react"

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white">
      {/* Contact Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 text-sm font-medium mb-8 cursor-default">
              <Globe className="w-4 h-4 mr-2" />
              Get In Touch
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              <span style={{color: '#59CBDC'}}>
                Contact Us
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto font-light">
              Ready to accelerate your Bittensor journey? Let's discuss how we can support your vision.
            </p>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 max-w-2xl mx-auto rounded-3xl overflow-hidden">
            <CardContent className="p-10">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                      First Name
                    </label>
                    <Input
                      className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl h-14 text-lg backdrop-blur-sm cursor-text"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                      Last Name
                    </label>
                    <Input
                      className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl h-14 text-lg backdrop-blur-sm cursor-text"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl h-14 text-lg backdrop-blur-sm cursor-text"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                    Message
                  </label>
                  <Textarea
                    className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl min-h-[140px] text-lg backdrop-blur-sm resize-none cursor-text"
                    placeholder="Tell us about your project and how we can help accelerate your success..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-white py-4 text-lg font-medium rounded-2xl shadow-xl transition-all duration-300 border-0 cursor-pointer"
                  style={{background: '#0891B2', boxShadow: '0 25px 50px -12px rgba(8, 145, 178, 0.25)'}}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0E7490' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0891B2' }}
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
