import { Search } from 'lucide-react'
import type { ChatConversation } from '../../../types/chat'

interface ConversationListProps {
    conversations: ChatConversation[]
    selectedId: string | null
    isLoading: boolean
    searchQuery: string
    onSelect: (id: string) => void
    onSearchChange: (query: string) => void
}

export function ConversationList({
    conversations,
    selectedId,
    isLoading,
    searchQuery,
    onSelect,
    onSearchChange,
}: ConversationListProps) {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Vừa xong'
        if (minutes < 60) return `${minutes}p`
        if (hours < 24) return `${hours}h`
        if (days < 7) return `${days}d`
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
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
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Quản lý Chat
                </h2>
                {/* Search */}
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                        <p className="text-gray-500 text-sm">
                            {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                        </p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedId === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                }`}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {getInitials(conv.user_name)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {conv.user_name}
                                    </h3>
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                        {formatTime(conv.last_message_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate mb-1">
                                    {conv.user_email}
                                </p>
                                {conv.last_message && (
                                    <p className="text-sm text-gray-500 truncate">
                                        {conv.last_message.sender_role === 'admin' && 'Bạn: '}
                                        {conv.last_message.content}
                                    </p>
                                )}
                                {conv.unread_count_by_admin > 0 && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {conv.unread_count_by_admin}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
