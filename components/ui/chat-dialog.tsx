"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai"
import {
  Send,
  MessageCircle,
  Loader2,
  Wand2,
  BookmarkCheck,
  Lock,
  AlertTriangle,
} from "lucide-react"

import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"
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
  cocktailInputs?: CocktailInput | null
  disabled?: boolean
}

type EditCocktailToolOutput = {
  success: boolean
  cocktail?: GenerateCocktail
  summary?: string
  message?: string
}

type SaveCocktailToolOutput = {
  status: "saved" | "requires-auth" | "error"
  cocktailName?: string
  savedCocktailId?: number
  message: string
}

type ToolPart<TOutput> = {
  type: string
  toolCallId: string
  state: "input-streaming" | "input-available" | "output-available" | "output-error"
  input?: Record<string, unknown>
  output?: TOutput
  errorText?: string
}

export function ChatDialog({
  cocktailName,
  cocktailData,
  cocktailInputs = null,
  disabled = false,
}: ChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [activeCocktail, setActiveCocktail] = useState<
    Partial<GenerateCocktail> | undefined
  >(cocktailData)
  const appliedEditIdRef = useRef<string | null>(null)

  const [input, setInput] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  useEffect(() => {
    setActiveCocktail(cocktailData)
    appliedEditIdRef.current = null
  }, [cocktailData])

  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant") {
        continue
      }

      for (const part of message.parts) {
        if (
          part.type === "tool-editCocktail" &&
          part.state === "output-available" &&
          part.toolCallId !== appliedEditIdRef.current
        ) {
          const output = part.output as EditCocktailToolOutput | undefined

          if (output?.success && output.cocktail) {
            setActiveCocktail(output.cocktail)
            appliedEditIdRef.current = part.toolCallId
          }
        }
      }
    }
  }, [messages])

  // Send cocktail context with each message
  const handleSendMessage = (message: string) => {
    const contextData = {
      cocktailName,
      cocktailData: activeCocktail
        ? {
            name: activeCocktail.name,
            description: activeCocktail.description,
            ingredients: activeCocktail.ingredients,
            instructions: activeCocktail.instructions,
            garnish: activeCocktail.garnish,
            glass: activeCocktail.glass,
            tags: activeCocktail.tags,
            notes: activeCocktail.notes,
          }
        : undefined,
      cocktailInputs,
    }

    // Send message with context in the body
    sendMessage({ text: message }, {
      body: contextData,
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

  const renderMessagePart = (part: unknown, index: number) => {
    const typedPart = part as {
      type: string
      text?: string
      toolCallId?: string
    }

    switch (typedPart.type) {
      case "text":
        return (
          <p key={`text-${index}`} className="whitespace-pre-wrap">
            {typedPart.text}
          </p>
        )
      case "tool-editCocktail":
        return (
          <EditCocktailToolPart
            key={typedPart.toolCallId ?? `edit-${index}`}
            part={part as ToolPart<EditCocktailToolOutput>}
          />
        )
      case "tool-saveCocktail":
        return (
          <SaveCocktailToolPart
            key={typedPart.toolCallId ?? `save-${index}`}
            part={part as ToolPart<SaveCocktailToolOutput>}
          />
        )
      default:
        return null
    }
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
                        ? `Hello! I'm here to answer any questions about your ${cocktailName} cocktail. Ask for substitutions, request tweaks, or have me save the spec for later.`
                        : "Hello! Ask about your cocktail, request an edit, or see how you can save builds to your library."}
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
                    <div className="space-y-3 text-sm leading-relaxed">
                      {message.parts.map((part, index) =>
                        renderMessagePart(part, index)
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

              {(status === "streaming" ||
                status === "submitted" ||
                status === "tool-calling" ||
                status === "requires-action" ||
                messages.some(
                  (m) =>
                    m.role === "assistant" &&
                    m.parts.some(
                      (p) => p.type === "text" && (p as { text?: string }).text === "",
                    ),
                )) && (
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

function EditCocktailToolPart({ part }: { part: ToolPart<EditCocktailToolOutput> }) {
  const changeRequest =
    typeof part.input?.changeRequest === "string"
      ? part.input?.changeRequest
      : undefined

  if (part.state === "input-streaming") {
    return (
      <ToolBubble icon={<Wand2 className="h-4 w-4 text-primary" />} title="Drafting edit">
        <p className="text-xs text-muted-foreground">
          Gathering the requested adjustments…
        </p>
      </ToolBubble>
    )
  }

  if (part.state === "input-available") {
    return (
      <ToolBubble icon={<Wand2 className="h-4 w-4 text-primary" />} title="Requested adjustments">
        <p className="text-sm text-foreground">
          {changeRequest ?? "Understanding the tweaks you'd like to make."}
        </p>
      </ToolBubble>
    )
  }

  if (part.state === "output-error") {
    return (
      <ToolBubble icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Edit unavailable" tone="error">
        <p className="text-sm">
          {part.errorText ?? "Something went wrong while updating the cocktail."}
        </p>
      </ToolBubble>
    )
  }

  if (part.state === "output-available") {
    const output = part.output

    if (!output?.success || !output.cocktail) {
      return (
        <ToolBubble icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Edit unavailable" tone="error">
          <p className="text-sm">
            {output?.message ?? "I couldn't produce an updated specification just yet."}
          </p>
        </ToolBubble>
      )
    }

    return (
      <ToolBubble icon={<Wand2 className="h-4 w-4 text-primary" />} title="Updated cocktail" tone="success">
        {output.summary ? (
          <p className="text-xs text-muted-foreground">{output.summary}</p>
        ) : null}
        <CocktailRecipePreview cocktail={output.cocktail} />
      </ToolBubble>
    )
  }

  return null
}

function SaveCocktailToolPart({ part }: { part: ToolPart<SaveCocktailToolOutput> }) {
  if (part.state === "input-streaming") {
    return (
      <ToolBubble icon={<BookmarkCheck className="h-4 w-4 text-primary" />} title="Preparing to save">
        <p className="text-xs text-muted-foreground">Confirming the cocktail details…</p>
      </ToolBubble>
    )
  }

  if (part.state === "input-available") {
    const cocktailName =
      typeof part.input?.cocktail === "object" && part.input?.cocktail !== null
        ? (part.input?.cocktail as { name?: string }).name
        : undefined

    return (
      <ToolBubble icon={<BookmarkCheck className="h-4 w-4 text-primary" />} title="Saving cocktail">
        <p className="text-sm text-foreground">
          {cocktailName
            ? `Locking in ${cocktailName} for your library…`
            : "Locking in this cocktail for your library…"}
        </p>
      </ToolBubble>
    )
  }

  if (part.state === "output-error") {
    return (
      <ToolBubble icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Save failed" tone="error">
        <p className="text-sm">
          {part.errorText ?? "I couldn't save the cocktail right now."}
        </p>
      </ToolBubble>
    )
  }

  if (part.state === "output-available") {
    const output = part.output

    if (!output) {
      return null
    }

    if (output.status === "saved") {
      return (
        <ToolBubble icon={<BookmarkCheck className="h-4 w-4 text-emerald-500" />} title="Saved" tone="success">
          <p className="text-sm">
            {output.message || `Saved ${output.cocktailName ?? "your cocktail"} to your profile.`}
          </p>
        </ToolBubble>
      )
    }

    if (output.status === "requires-auth") {
      return (
        <ToolBubble icon={<Lock className="h-4 w-4 text-amber-500" />} title="Sign in to save" tone="warning">
          <p className="text-sm">
            {output.message || "Create an account to bookmark your favorite builds."}
          </p>
        </ToolBubble>
      )
    }

    return (
      <ToolBubble icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Save failed" tone="error">
        <p className="text-sm">
          {output.message || "Something went wrong while saving."}
        </p>
      </ToolBubble>
    )
  }

  return null
}

function CocktailRecipePreview({ cocktail }: { cocktail: GenerateCocktail }) {
  const ingredients = Array.isArray(cocktail.ingredients)
    ? cocktail.ingredients
    : typeof cocktail.ingredients === "string"
      ? [cocktail.ingredients]
      : []
  const instructions = Array.isArray(cocktail.instructions)
    ? cocktail.instructions
    : typeof cocktail.instructions === "string"
      ? [cocktail.instructions]
      : []
  const tags = Array.isArray(cocktail.tags) ? cocktail.tags : []

  return (
    <div className="space-y-3 text-sm text-foreground">
      <div>
        <p className="text-base font-semibold text-foreground">{cocktail.name}</p>
        {cocktail.description ? (
          <p className="text-sm text-muted-foreground">{cocktail.description}</p>
        ) : null}
      </div>

      {ingredients.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingredients</p>
          <ul className="mt-1 space-y-1 text-sm">
            {ingredients.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {instructions.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instructions</p>
          <ol className="mt-1 space-y-1 text-sm">
            {instructions.map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-2">
                <span className="font-semibold text-primary">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        {cocktail.glass ? (
          <span>
            <strong className="font-semibold text-foreground">Glass:</strong> {cocktail.glass}
          </span>
        ) : null}
        {cocktail.garnish ? (
          <span>
            <strong className="font-semibold text-foreground">Garnish:</strong> {cocktail.garnish}
          </span>
        ) : null}
        {tags.length > 0 ? (
          <span>
            <strong className="font-semibold text-foreground">Tags:</strong> {tags.join(", ")}
          </span>
        ) : null}
        {cocktail.notes ? (
          <span className="sm:col-span-2">
            <strong className="font-semibold text-foreground">Notes:</strong> {cocktail.notes}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ToolBubble({
  icon,
  title,
  children,
  tone = "default",
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
  tone?: "default" | "success" | "warning" | "error"
}) {
  const toneClasses: Record<"default" | "success" | "warning" | "error", string> = {
    default: "border-border/60 bg-background/60",
    success: "border-emerald-500/40 bg-emerald-500/10",
    warning: "border-amber-500/40 bg-amber-500/10",
    error: "border-destructive/50 bg-destructive/10",
  }

  return (
    <div className={cn("space-y-2 rounded-xl border px-3 py-3", toneClasses[tone])}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/70">
          {icon}
        </span>
        {title}
      </div>
      {children ? <div className="space-y-2 text-foreground">{children}</div> : null}
    </div>
  )
}
