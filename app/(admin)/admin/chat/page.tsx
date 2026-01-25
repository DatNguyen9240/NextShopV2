'use client'

import { useAdminChat } from '../../../hooks/useAdminChat'
import { ConversationList } from './ConversationList'
import { AdminChatWindow } from './AdminChatWindow'

export default function AdminChatPage() {
    const {
        conversations,
        selectedConversationId,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isSending,
        isUserTyping,
        isUserOnline,
        lastUserSeen,
        searchQuery,
        selectConversation,
        sendMessage,
        deleteMessage,
        handleInputChange,
        setSearchQuery,
    } = useAdminChat()

    const selectedConversation =
        conversations.find((c) => c.id === selectedConversationId) || null

    return (
        <div className="h-[calc(100vh-80px)] flex bg-gray-100">
            {/* Conversations List - Left Side */}
            <div className="w-full md:w-96 flex-shrink-0">
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId}
                    isLoading={isLoadingConversations}
                    searchQuery={searchQuery}
                    onSelect={selectConversation}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Chat Window - Right Side */}
            <div className="flex-1 hidden md:flex">
                <AdminChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    isLoading={isLoadingMessages}
                    isSending={isSending}
                    isTyping={isUserTyping}
                    isOnline={isUserOnline}
                    lastSeen={lastUserSeen}
                    onSendMessage={sendMessage}
                    onDeleteMessage={deleteMessage}
                    onInputChange={handleInputChange}
                />
            </div>

            {/* Mobile: Show chat window when conversation is selected */}
            {selectedConversationId && (
                <div className="fixed inset-0 bg-white z-50 md:hidden">
                    <button
                        onClick={() => selectConversation('')}
                        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <AdminChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        isLoading={isLoadingMessages}
                        isSending={isSending}
                        isTyping={isUserTyping}
                        isOnline={isUserOnline}
                        lastSeen={lastUserSeen}
                        onSendMessage={sendMessage}
                        onDeleteMessage={deleteMessage}
                        onInputChange={handleInputChange}
                    />
                </div>
            )}
        </div>
    )
}
