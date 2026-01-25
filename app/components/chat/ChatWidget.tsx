'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useChatWidget } from '../../hooks/useChatWidget'
import { ChatWindow } from './ChatWindow'

export function ChatWidget() {
    const {
        isOpen,
        messages,
        unreadCount,
        isLoading,
        isSending,
        isAdminTyping,
        isAdminOnline,
        lastAdminSeen,
        toggleWidget,
        sendMessage,
        deleteMessage,
        handleInputChange,
    } = useChatWidget()

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <ChatWindow
                isOpen={isOpen}
                messages={messages}
                unreadCount={unreadCount}
                isLoading={isLoading}
                isSending={isSending}
                isTyping={isAdminTyping}
                isOnline={isAdminOnline}
                lastSeen={lastAdminSeen}
                onClose={toggleWidget}
                onSendMessage={sendMessage}
                onDeleteMessage={deleteMessage}
                onInputChange={handleInputChange}
            />

            {/* Floating Button */}
            <motion.button
                onClick={toggleWidget}
                className="pointer-events-auto bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-[9999] group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Mở chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                        >
                            <MessageCircle size={24} />
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse animation when there are unread messages */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></span>
                )}
            </motion.button>
        </div>
    )
}
