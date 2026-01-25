import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../../types/chat'
import { ChatMessage } from './ChatMessage'

interface ChatWindowProps {
    isOpen: boolean
    messages: ChatMessageType[]
    unreadCount: number
    isLoading: boolean
    isSending: boolean
    isTyping: boolean
    isOnline: boolean
    lastSeen: Date | null
    onClose: () => void
    onSendMessage: (content: string) => Promise<void>
    onDeleteMessage?: (id: string) => Promise<void>
    onInputChange: (value: string) => void
}

export function ChatWindow({
    isOpen,
    messages,
    unreadCount,
    isLoading,
    isSending,
    isTyping,
    isOnline,
    lastSeen,
    onClose,
    onSendMessage,
    onDeleteMessage,
    onInputChange,
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState('')
    const [lastSeenText, setLastSeenText] = useState<string>('')

    // Update last seen text every minute
    useEffect(() => {
        const updateText = () => {
            if (isOnline) {
                setLastSeenText('Đang online')
                return
            }
            if (!lastSeen) {
                setLastSeenText('Ngoại tuyến')
                return
            }

            const diff = Math.floor((new Date().getTime() - lastSeen.getTime()) / 60000)
            if (diff < 1) setLastSeenText('Vừa mới hoạt động')
            else if (diff < 60) setLastSeenText(`Hoạt động ${diff} phút trước`)
            else {
                const hours = Math.floor(diff / 60)
                if (hours < 24) setLastSeenText(`Hoạt động ${hours} giờ trước`)
                else setLastSeenText('Ngoại tuyến')
            }
        }

        updateText()
        const interval = setInterval(updateText, 60000)
        return () => clearInterval(interval)
    }, [isOnline, lastSeen])

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const prevMessagesLength = useRef(messages.length)
    const prevIsOpen = useRef(isOpen)

    // Auto-scroll logic: only for new messages or opening with unread
    useEffect(() => {
        if (!isOpen) {
            prevIsOpen.current = false
            return
        }

        const scrollToBottom = () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
            }
        }

        const newMessagesArrived = messages.length > prevMessagesLength.current
        const openedWithUnread = !prevIsOpen.current && unreadCount > 0

        if (newMessagesArrived || openedWithUnread || isTyping) {
            const timer = setTimeout(scrollToBottom, 50)
            prevMessagesLength.current = messages.length
            prevIsOpen.current = true
            return () => clearTimeout(timer)
        }

        prevMessagesLength.current = messages.length
        prevIsOpen.current = true
    }, [messages, isOpen, unreadCount, isTyping])

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
        if (onInputChange) {
            onInputChange(val)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-24 right-6 w-[420px] h-[650px] bg-slate-50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex flex-col overflow-hidden z-[9998] max-w-[calc(100vw-48px)] max-h-[calc(100vh-140px)] pointer-events-auto"
                >
                    {/* Header: Glassmorphism */}
                    <div className="bg-white/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-slate-200/60 sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <MessageCircle size={24} className="text-white" />
                                </div>
                                {isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800 tracking-tight text-lg">NextShop Support</h3>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-blue-500 font-semibold text-[11px] uppercase tracking-wider">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                    {lastSeenText}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200"
                            aria-label="Đóng chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50 flex flex-col gap-2 custom-scroll"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="bg-blue-100 rounded-full p-4 mb-4">
                                    <svg
                                        className="w-8 h-8 text-blue-500"
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
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Bắt đầu cuộc trò chuyện
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Gửi tin nhắn để bắt đầu chat với đội ngũ hỗ trợ của chúng tôi
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => {
                                    const isLastRead = message.is_read &&
                                        message.sender_role === 'user' &&
                                        index === messages.filter(m => m.sender_role === 'user').length - 1;

                                    return (
                                        <ChatMessage
                                            key={message.id}
                                            message={message}
                                            isOwnMessage={message.sender_role === 'user'}
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
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Admin đang nhập...</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Input Area: Redesigned as a floating island */}
                    <div className="px-6 py-6 bg-slate-50">
                        <div className="bg-white border border-slate-200/80 p-2.5 rounded-[24px] shadow-sm flex items-end gap-2 group transition-all duration-300 focus-within:shadow-lg focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/5">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                disabled={isSending}
                                className="flex-1 resize-none border-none bg-transparent rounded-xl px-4 py-3 focus:ring-0 disabled:cursor-not-allowed max-h-32 text-sm text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isSending}
                                className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
                                aria-label="Gửi tin nhắn"
                            >
                                {isSending ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <Send size={20} className="fill-current" />
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
