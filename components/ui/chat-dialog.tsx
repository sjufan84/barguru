"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, MessageCircle, Loader2 } from "lucide-react"

import type { GenerateCocktail } from "@/schemas/cocktailSchemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ChatDialogProps {
  cocktailName?: string
  cocktailData?: Partial<GenerateCocktail>
  disabled?: boolean
}

export function ChatDialog({ cocktailName, cocktailData, disabled = false }: ChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    onError: (error) => {
      console.error("Chat error:", error)
    },
    onFinish: () => {
      console.log("Chat finished")
    },
  })

  // Send cocktail context with each message
  const handleSendMessage = (message: string) => {
    const contextData = {
      cocktailName,
      cocktailData: cocktailData ? {
        name: cocktailData.name,
        description: cocktailData.description,
        ingredients: cocktailData.ingredients,
        instructions: cocktailData.instructions,
        garnish: cocktailData.garnish,
        glass: cocktailData.glass,
        tags: cocktailData.tags,
        notes: cocktailData.notes,
      } : undefined,
    }

    // Send message with context in the body
    sendMessage({ 'text': message }, {
      body: contextData
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (input.trim() && status === "ready") {
      handleSendMessage(input.trim())
      setInput("")
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Ask about this cocktail
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col sm:h-[70vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Cocktail Assistant
          </DialogTitle>
          <DialogDescription>
            {cocktailName
              ? `Ask questions about your ${cocktailName} cocktail`
              : "Ask questions about your generated cocktail"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex justify-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <p className="text-sm">
                      {cocktailName
                        ? `Hello! I'm here to answer any questions about your **${cocktailName}** cocktail. What would you like to know?`
                        : "Hello! I'm here to answer any questions about your cocktail. What would you like to know?"}
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          <span key={index}>{part.text}</span>
                        ) : null
                      )}
                    </div>
                    <p className="mt-1 text-xs opacity-70">
                      {new Date(Date.now()).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <span className="text-sm font-medium text-primary-foreground">
                        You
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {(status === "streaming" || status === "submitted" || messages.some(m => m.role === "assistant" && m.parts.some(p => p.type === "text" && p.text === ""))) && (
                <div className="flex justify-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <MessageCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="rounded-2xl bg-destructive/10 px-4 py-3">
                    <p className="text-sm text-destructive">
                      {error.message || "Something went wrong. Please try again."}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ingredients, substitutions, techniques..."
              disabled={status !== "ready"}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
              size="icon"
            >
              {status === 'submitted' || status === 'streaming' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}