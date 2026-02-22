import { useState, useEffect, useRef, FormEvent } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../supabase'

interface Message {
  id: string
  message: string
  is_user: boolean
  context_used: string | null
  created_at: string
}

export default function ChatPage() {
  const { session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user?.id) {
      loadChatHistory()
    }
  }, [session?.user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadChatHistory() {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error loading chat history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || !session?.user?.id) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message optimistically
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      message: userMessage,
      is_user: true,
      context_used: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      // Call chat-completion Edge Function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          message: userMessage,
          user_id: session.user.id,
        },
      })

      if (error) throw error

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        message: data.response,
        is_user: false,
        context_used: data.sources,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      console.error('Error sending message:', err)
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error. Please try again.',
        is_user: false,
        context_used: null,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  if (loadingHistory) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-100">Increm <span className="text-gradient">AI Coach</span></h1>
          <p className="mt-1 text-sm text-surface-400">
            Ask me anything about fitness, training, and nutrition
          </p>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-5xl mb-4">🤖</div>
                <p className="text-lg font-semibold text-slate-200 mb-2">
                  Welcome to Increm AI!
                </p>
                <p className="text-sm text-surface-400 max-w-md mb-6">
                  I'm here to help you with fitness questions. Try asking me about:
                </p>
                <div className="grid grid-cols-1 gap-2 text-sm text-left max-w-md">
                  <button
                    onClick={() => setInput('How do I improve my bench press?')}
                    className="rounded-btn bg-surface-700 hover:bg-surface-600 px-4 py-2 text-slate-300 transition-colors text-left"
                  >
                    💪 How do I improve my bench press?
                  </button>
                  <button
                    onClick={() => setInput('What is progressive overload?')}
                    className="rounded-btn bg-surface-700 hover:bg-surface-600 px-4 py-2 text-slate-300 transition-colors text-left"
                  >
                    📈 What is progressive overload?
                  </button>
                  <button
                    onClick={() => setInput('How much protein do I need to build muscle?')}
                    className="rounded-btn bg-surface-700 hover:bg-surface-600 px-4 py-2 text-slate-300 transition-colors text-left"
                  >
                    🥩 How much protein do I need?
                  </button>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-card p-4 ${
                      msg.is_user
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-700 text-slate-100'
                    }`}
                  >
                    {!msg.is_user && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-xs font-medium text-surface-400">
                          Increm AI
                        </span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    {!msg.is_user && msg.context_used && (
                      <div className="mt-2 pt-2 border-t border-surface-600">
                        <Badge variant="default" className="text-xs">
                          Sources: {msg.context_used}
                        </Badge>
                      </div>
                    )}
                    <p className="mt-2 text-xs opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-card bg-surface-700 p-4">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-surface-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-surface-700 p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about fitness..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
