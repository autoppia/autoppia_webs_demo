'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent } from './ui/card'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setNotification(null)

    try {
      const response = await fetch('/localhost:8000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
        })
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 max-w-2xl mx-auto rounded-3xl overflow-hidden">
      <CardContent className="p-10">
        {notification && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            notification.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                First Name
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl h-14 text-lg backdrop-blur-sm cursor-text"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
                Last Name
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl h-14 text-lg backdrop-blur-sm cursor-text"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-white/80 mb-3 cursor-pointer">
              Message
            </label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl min-h-[140px] text-lg backdrop-blur-sm resize-none cursor-text"
              placeholder="Tell us about your project and how we can help accelerate your success..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white py-4 text-lg font-medium rounded-2xl shadow-xl transition-all duration-300 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{background: isSubmitting ? '#0E7490' : '#0891B2', boxShadow: '0 25px 50px -12px rgba(8, 145, 178, 0.25)'}}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#0E7490' }}
            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#0891B2' }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
