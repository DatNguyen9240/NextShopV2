import { Check, CheckCheck, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ChatMessage } from '../../types/chat'

interface ChatMessageProps {
    message: ChatMessage
    isOwnMessage: boolean
    onDelete?: (id: string) => void
    showSeenIndicator?: boolean
}

export function ChatMessage({ message, isOwnMessage, onDelete, showSeenIndicator }: ChatMessageProps) {
    const isDeleted = message.is_deleted || message.content === 'Tin nhắn đã được gỡ'

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    const isToday = () => {
        const date = new Date(message.created_at)
        const now = new Date()
        return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-6 group`}
        >
            <div className={`flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Message Bubble */}
                <div
                    className={`max-w-[85%] relative px-5 py-3 rounded-2xl shadow-sm transition-all duration-300 ${isOwnMessage
                        ? isDeleted
                            ? 'bg-slate-100 border border-slate-200 text-slate-400'
                            : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20 shadow-lg'
                        : isDeleted
                            ? 'bg-slate-100 border border-slate-200 text-slate-400'
                            : 'bg-white border border-slate-100 text-slate-800'
                        } ${isDeleted ? 'backdrop-blur-sm' : ''}`}
                >
                    {!isOwnMessage && (
                        <div className="text-[11px] font-bold mb-1 uppercase tracking-widest text-blue-500/80">
                            {message.sender_name}
                        </div>
                    )}

                    <div className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${isDeleted ? 'italic font-medium' : 'font-normal'}`}>
                        {isDeleted ? 'Tin nhắn đã được gỡ' : message.content}
                    </div>

                    {/* Delete Action (Hidden behind hover) */}
                    {isOwnMessage && onDelete && !isDeleted && isToday() && (
                        <button
                            onClick={() => onDelete(message.id)}
                            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100"
                            title="Gỡ tin nhắn"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Status Icons */}
                <div className={`text-[10px] flex flex-col justify-end h-full gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {!isDeleted && isOwnMessage && (
                        <div className="flex items-center transition-opacity duration-300">
                            {message.is_read ? (
                                <CheckCheck size={14} className="text-blue-500 animate-in zoom-in-50" />
                            ) : (
                                <Check size={14} className="text-slate-300" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Meta Info */}
            <div className={`mt-1.5 flex items-center gap-2 px-1 text-[11px] font-medium ${isOwnMessage ? 'text-slate-400' : 'text-slate-400'}`}>
                <span>{formatTime(message.created_at)}</span>
                {showSeenIndicator && message.is_read && isOwnMessage && !isDeleted && (
                    <span className="flex items-center gap-1 text-blue-500 font-bold animate-in fade-in slide-in-from-right-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                        Đã xem
                    </span>
                )}
            </div>
        </motion.div>
    )
}
