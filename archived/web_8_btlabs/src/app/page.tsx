"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ChevronRight, Cpu, Network, Cloud, Zap, Globe, Shield, Star, TrendingUp, Users, Twitter, Send, Pickaxe, Linkedin, Menu } from "lucide-react"
import { TwitterXIcon } from "@/components/TwitterXIcon"
import { CloudLogo } from "@/components/CloudLogo"
import { BittensorCloudLogo } from "@/components/BittensorCloudLogo"
import ContactForm from "@/components/ContactForm"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-violet-500/15 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-pink-400/15 to-fuchsia-500/15 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img
                src="/btlabs-logo.png"
                alt="BTLabs"
                className="h-6 w-auto cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="text-white/80 hover:text-white transition-all duration-300 font-medium tracking-wide cursor-pointer">Home</a>
                <a href="#activities" className="text-white/80 hover:text-white transition-all duration-300 font-medium tracking-wide cursor-pointer">Areas of Focus</a>
                <a href="#bittensorcloud" className="text-white/80 hover:text-white transition-all duration-300 font-medium tracking-wide cursor-pointer">BittensorCloud</a>
                <a href="#contact" className="text-white/80 hover:text-white transition-all duration-300 font-medium tracking-wide cursor-pointer">Contact</a>
                <div className="flex items-center space-x-4 ml-6">
                  <a href="https://x.com/btlabs_ai" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                    <TwitterXIcon className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/btlabs-ai/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="md:hidden flex items-center space-x-4">
                <a href="https://x.com/btlabs_ai" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                  <TwitterXIcon className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/company/btlabs-ai/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="mb-8 space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 text-sm font-medium mb-4 mt-20 cursor-default">
              <Star className="w-4 h-4 mr-2" />
              Democratizing Intelligence
            </div>

            <h1 className="font-black tracking-tight leading-none">
              <span className="block text-white mb-2 text-5xl sm:text-7xl md:text-8xl">
                Empowering
              </span>
              <span className="block text-white mb-2 text-5xl sm:text-7xl md:text-8xl">
                the future of
              </span>
              <span className="block text-5xl sm:text-7xl md:text-8xl" style={{color: '#59CBDC'}} >
                Decentralized AI
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-light">
              Your trusted partner in the Bittensor ecosystem, driving value through <span className="text-pink-400 font-semibold">mining operations</span>,
              <span className="text-green-400 font-semibold"> subnet development</span>, and
              <span className="text-blue-400 font-semibold"> infrastructure services</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 text-lg font-medium rounded-2xl shadow-2xl transition-all duration-300 group border-0 cursor-pointer"
              onClick={() => document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              What We're Building
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/30 hover:text-white px-10 py-4 text-lg font-medium rounded-2xl transition-all duration-300 cursor-pointer"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Areas of Focus Section */}
      <section id="activities" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 text-sm font-medium mb-8 cursor-default">
              <TrendingUp className="w-4 h-4 mr-2" />
              The Foundation of Our Work
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">
              Areas of Focus
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto font-light">
              Driving the Bittensor ecosystem forward through active participation, innovation, and cutting-edge infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mining Team */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-pink-500/20">
                  <Cpu className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors mb-3">
                  Mining Operations
                </CardTitle>
                <CardDescription className="text-white/60 text-lg">
                  Our team brings over 1.5 years of experience mining across a diverse range of subnets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <p className="text-white/80 leading-relaxed">
                  We're actively expanding our team to align expertise with new domains and subnets that share our vision
                </p>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-blue-400 mb-3 text-lg">Infrastructure Subnets</h4>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center justify-between">
                        <span>Chutes (64)</span>
                        <span className="text-blue-400">Infrastructure</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Targon (4)</span>
                        <span className="text-blue-400">Computing</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Celium (51)</span>
                        <span className="text-blue-400">Networks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NicheImage (23)</span>
                        <span className="text-blue-400">Processing</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-purple-400 mb-3 text-lg">ML Training Subnets</h4>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center justify-between">
                        <span>404 (17)</span>
                        <span className="text-purple-400">Training</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ItsAI (32)</span>
                        <span className="text-purple-400">Development</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subnet Development */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-green-500/20">
                  <Network className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white group-hover:text-green-400 transition-colors mb-3">
                  Subnet Development
                </CardTitle>
                <CardDescription className="text-white/60 text-lg">
                  Subnet owners and developers building next-generation solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <p className="text-white/80 leading-relaxed">
                  From strategic advisory and infrastructure to full ownership, we support a growing portfolio of subnets across Bittensor.
                </p>

                <div className="space-y-4">
                  <div
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20 cursor-pointer hover:border-cyan-400/40 transition-all duration-300"
                    onClick={() => window.open('https://autoppia.com', '_blank')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-cyan-400 text-lg">Web Agents - Autoppia</h4>
                      <span className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium">SN36</span>
                    </div>
                    <p className="text-white/70 leading-relaxed text-sm">
                      Autonomous Web Agents that operate the browser on your behalf.
                    </p>
                  </div>

                  <div
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 cursor-pointer hover:border-green-400/40 transition-all duration-300"
                    onClick={() => window.open('https://www.yanezcompliance.com/', '_blank')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-green-400 text-lg">Yanez Compliance</h4>
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Soon
                      </span>
                    </div>
                    <p className="text-white/70 leading-relaxed text-sm">
                      AI-powered Automation for Testing, Tuning, and Financial Crime Prevention Model Validation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bittensorcloud.com */}
            <Card
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden cursor-pointer"
              onClick={() => window.open('https://bittensorcloud.com/', '_blank')}
            >
              <CardHeader className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-blue-500/20">
                  <Cloud className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-400 transition-colors mb-3">
                  Infrastructure Services
                </CardTitle>
                <CardDescription className="text-white/60 text-lg">
                  Seamless Compute for Bittensor Projects, Large or Small
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <p className="text-white/80 leading-relaxed">
                  Tailored infrastructure solutions designed to support every stage of your Bittensor journey,
                  from individual miners to enterprise-scale operations.
                </p>

                <div className="space-y-4">
                  {/* Top row with three small tiles */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-white/5 rounded-2xl p-2 sm:p-4 border border-white/10 flex flex-col items-center text-center">
                      <Pickaxe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-1 sm:mb-2" />
                      <span className="text-white/80 font-medium text-xs sm:text-sm">Miners</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-2 sm:p-4 border border-white/10 flex flex-col items-center text-center">
                      <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-1 sm:mb-2" />
                      <span className="text-white/80 font-medium text-xs sm:text-sm">Validators</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-2 sm:p-4 border border-white/10 flex flex-col items-center text-center">
                      <Network className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-1 sm:mb-2" />
                      <span className="text-white/80 font-medium text-xs sm:text-sm">Subnets</span>
                    </div>
                  </div>

                  {/* Large tile spanning full width */}
                  <div
                    className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20 cursor-pointer hover:border-blue-400/40 transition-all duration-300"
                    onClick={() => window.open('https://bittensorcloud.com', '_blank')}
                  >
                    <div className="mb-3">
                      <BittensorCloudLogo className="h-5 w-auto" />
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      Unlock global computing power with zero middlemen, so you can focus on building, mining, and scaling your TAO-driven ambitions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bittensorcloud.com Feature Section */}
      <section id="bittensorcloud" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-8 cursor-default" style={{color: '#59CBDC'}}>
              <Cloud className="w-4 h-4 mr-2" />
              Infrastructure Platform
            </div>
            <div className="mb-6 flex justify-center">
              <BittensorCloudLogo className="h-12 w-auto" />
            </div>
            <p className="text-xl text-white/60 max-w-3xl mx-auto font-light">
              Get your Bittensor projects off the ground with global access, instant deployment, and TAO-driven payments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#59CBDC'}}>
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
                    <p className="text-white/70 leading-relaxed">
                      Deploy your Bittensor projects worldwide with our distributed infrastructure network.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#59CBDC'}}>
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Instant Deployment</h3>
                    <p className="text-white/70 leading-relaxed">
                      Get your miners and validators running in minutes with our streamlined deployment process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#59CBDC'}}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">TAO-Driven</h3>
                    <p className="text-white/70 leading-relaxed">
                      Pay directly with TAO tokens for seamless integration with the Bittensor ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-500/20 backdrop-blur-xl">
                <img
                  src="/bittensorcloud-screenshot.png"
                  alt="Bittensorcloud.com Platform Interface"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Centered Get Started Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="text-white px-10 py-4 text-lg font-medium rounded-2xl shadow-2xl transition-all duration-300 group border-0 cursor-pointer"
              style={{background: '#0891B2', boxShadow: '0 25px 50px -12px rgba(8, 145, 178, 0.25)'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0E7490' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0891B2' }}
              onClick={() => window.open('https://bittensorcloud.com/', '_blank')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-8 cursor-default" style={{color: '#59CBDC'}}>
              <Users className="w-4 h-4 mr-2" />
              Your Bittensor Partner
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-white/60 max-w-4xl mx-auto font-light leading-relaxed">
              Whether you're developing transformative AI technologies, exploring innovative research,
              or seeking infrastructure support, BTLabs is your gateway to success in the Bittensor ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Left Column - Infrastructure & Capital */}
            <div className="space-y-6">
              {/* Infrastructure Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden h-32">
                <CardContent className="p-8 h-full flex items-center">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Cloud className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        GPU & Infrastructure Edge
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Through strategic datacenter partnerships, we provide miners and subnets with enterprise-grade GPUs at competitive rates, enabling effortless scaling.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capital Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden h-32">
                <CardContent className="p-8 h-full flex items-center">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Capital & VC Access
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Using our own capital and strategic VC connections, we enable subnets and miners to secure the funding runway they need to grow.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Talent & Network */}
            <div className="space-y-6">
              {/* Talent Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden h-32">
                <CardContent className="p-8 h-full flex items-center">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Talent & Team Guidance
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Backed by our experience in mining and subnet operations, we help founders recruit top talent and even onboard non crypto tech & AI teams.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-pink-500/30 transition-all duration-500 group hover:bg-white/10 rounded-3xl overflow-hidden h-32">
                <CardContent className="p-8 h-full flex items-center">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Network className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Partnership & Network Support
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        We bridge data providers, validators, researchers, mining teams, and funds across the ecosystem, sparking collaborations and synergies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA Button - Outside Card */}
          <div className="text-center mt-16">
            <Button
              size="lg"
              className="text-white px-12 py-5 text-xl font-medium rounded-2xl shadow-2xl transition-all duration-300 group border-0 cursor-pointer"
              style={{background: '#0891B2', boxShadow: '0 25px 50px -12px rgba(8, 145, 178, 0.25)'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0E7490' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0891B2' }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Journey
              <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-cyan-400 text-sm font-medium mb-8 cursor-default">
              <Globe className="w-4 h-4 mr-2" />
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">
              Contact Us
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto font-light">
              Ready to accelerate your Bittensor journey? Let's discuss how we can support your vision.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-xl border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <img
                src="/btlabs-logo.png"
                alt="BTLabs"
                className="h-6 w-auto cursor-pointer"
              />
              <div className="text-white/60 font-light text-sm text-center sm:text-left">
                © 2025 BTLabs. All rights reserved.
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <a href="https://x.com/btlabs_ai" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                  <TwitterXIcon className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/company/btlabs-ai/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              <a href="/privacy" className="text-white/60 hover:text-cyan-400 transition-colors cursor-pointer text-base">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
