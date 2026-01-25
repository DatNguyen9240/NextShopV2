import { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'
import type { ChatMessage, ChatConversation } from '../../../types/chat'
import { ChatMessage as ChatMessageComponent } from '../../../components/chat/ChatMessage'

interface AdminChatWindowProps {
    conversation: ChatConversation | null
    messages: ChatMessage[]
    isLoading: boolean
    isSending: boolean
    isTyping: boolean
    isOnline: boolean
    lastSeen: Date | null
    onSendMessage: (content: string) => void
    onDeleteMessage?: (id: string) => void
    onInputChange: (value: string) => void
}

export function AdminChatWindow({
    conversation,
    messages,
    isLoading,
    isSending,
    isTyping,
    isOnline,
    lastSeen,
    onSendMessage,
    onDeleteMessage,
    onInputChange,
}: AdminChatWindowProps) {
    const [inputValue, setInputValue] = useState('')
    const [lastSeenText, setLastSeenText] = useState<string>('')

    // Update last seen text every minute
    useEffect(() => {
        const updateText = () => {
            if (isOnline) {
                setLastSeenText('Online')
                return
            }
            if (!lastSeen) {
                setLastSeenText('Offline')
                return
            }

            const diff = Math.floor((new Date().getTime() - lastSeen.getTime()) / 60000)
            if (diff < 1) setLastSeenText('Vừa mới hoạt động')
            else if (diff < 60) setLastSeenText(`Hoạt động ${diff} phút trước`)
            else {
                const hours = Math.floor(diff / 60)
                if (hours < 24) setLastSeenText(`Hoạt động ${hours} giờ trước`)
                else setLastSeenText('Offline')
            }
        }

        updateText()
        const interval = setInterval(updateText, 60000)
        return () => clearInterval(interval)
    }, [isOnline, lastSeen])

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-scroll to bottom with a small delay to ensure DOM is ready
    useEffect(() => {
        if (scrollContainerRef.current) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [messages, isTyping, conversation?.id, isLoading])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [inputValue])

    const handleSend = () => {
        if (inputValue.trim() && !isSending) {
            onSendMessage(inputValue)
            setInputValue('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        setInputValue(val)
        onInputChange(val)
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <div className="bg-blue-100 rounded-full p-6 mb-4">
                    <svg
                        className="w-12 h-12 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chọn một cuộc trò chuyện
                </h3>
                <p className="text-gray-600">
                    Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu chat
                </p>
            </div>
        )
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex-1 flex flex-col bg-[#F8FAFC]">
            {/* Header: Glassmorphism */}
            <div className="px-8 py-5 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                            {getInitials(conversation.user_name)}
                        </div>
                        {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 tracking-tight text-lg">
                                {conversation.user_name}
                            </h3>
                            {isOnline && (
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100">
                                    Online
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col mt-0.5">
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{lastSeenText}</p>
                            <p className="text-xs text-slate-400/80 font-medium">{conversation.user_email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-8 py-6 bg-[#F8FAFC] flex flex-col gap-2 custom-scroll"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isLastRead = message.is_read &&
                                message.sender_role === 'admin' &&
                                index === messages.filter(m => m.sender_role === 'admin').length - 1;

                            return (
                                <ChatMessageComponent
                                    key={message.id}
                                    message={message}
                                    isOwnMessage={message.sender_role === 'admin'}
                                    onDelete={onDeleteMessage}
                                    showSeenIndicator={isLastRead}
                                />
                            );
                        })}

                        {isTyping && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">{conversation.user_name} đang nhập...</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area: Redesigned as a floating island */}
            <div className="px-8 py-6 bg-[#F8FAFC]">
                <div className="bg-white border border-slate-200/80 p-2.5 rounded-[24px] shadow-sm flex items-end gap-3 group transition-all duration-300 focus-within:shadow-xl focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/5">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        disabled={isSending}
                        className="flex-1 resize-none border-none bg-transparent rounded-xl px-4 py-3 focus:ring-0 disabled:cursor-not-allowed max-h-32 text-[15px] text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending}
                        className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 flex-shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {isSending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Send size={18} className="fill-current" />
                                <span className="font-bold tracking-wide uppercase text-xs">Gửi</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
