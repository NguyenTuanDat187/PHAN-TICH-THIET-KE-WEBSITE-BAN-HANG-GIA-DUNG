
import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';

import ConversationList from './components/ConversationList';
import ConversationChat from './components/ConversationChat';

import {
  conversationMessagesMock,
  conversationsMock,
} from '../../mocks/conversations.mock';

import type {
  ConversationListItem,
  ConversationStatus,
  MessageView,
} from '../../types/conversation.types';

const CURRENT_ADMIN_ID = 1;
const CURRENT_ADMIN_NAME = 'Admin';

export default function ConversationsPage() {
  const [conversations, setConversations] =
    useState<ConversationListItem[]>(conversationsMock);

  const [messages, setMessages] =
    useState<MessageView[]>(conversationMessagesMock);

  const [selectedId, setSelectedId] = useState<number | null>(
    conversationsMock[0]?.id ?? null,
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | ConversationStatus
  >('all');

  const selectedConversation =
    conversations.find((item) => item.id === selectedId) ?? null;

  const visibleConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return conversations
      .filter((conversation) => {
        const matchesSearch =
          !keyword ||
          conversation.customer_name.toLowerCase().includes(keyword) ||
          conversation.customer_email.toLowerCase().includes(keyword) ||
          (conversation.subject ?? '').toLowerCase().includes(keyword) ||
          (conversation.last_message_preview ?? '')
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
          statusFilter === 'all' || conversation.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = a.last_message_at
          ? new Date(a.last_message_at).getTime()
          : 0;

        const timeB = b.last_message_at
          ? new Date(b.last_message_at).getTime()
          : 0;

        return timeB - timeA;
      });
  }, [conversations, search, statusFilter]);

  const selectedMessages = useMemo(
    () =>
      messages
        .filter((message) => message.conversation_id === selectedId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    [messages, selectedId],
  );

  const stats = useMemo(
    () => ({
      total: conversations.length,
      open: conversations.filter((item) => item.status === 'open').length,
      pending: conversations.filter((item) => item.status === 'pending').length,
      unread: conversations.reduce(
        (total, item) => total + item.admin_unread_count,
        0,
      ),
    }),
    [conversations],
  );

  const handleSelectConversation = (
    conversation: ConversationListItem,
  ) => {
    setSelectedId(conversation.id);

    setMessages((current) =>
      current.map((message) =>
        message.conversation_id === conversation.id &&
        message.sender_role === 'customer'
          ? {
              ...message,
              is_read: true,
              read_at: message.read_at ?? new Date().toISOString(),
            }
          : message,
      ),
    );

    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id
          ? { ...item, admin_unread_count: 0 }
          : item,
      ),
    );
  };

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;

    const now = new Date().toISOString();

    const newMessage: MessageView = {
      id:
        messages.reduce((maxId, message) => Math.max(maxId, message.id), 0) +
        1,
      conversation_id: selectedConversation.id,
      sender_id: CURRENT_ADMIN_ID,
      message_type: 'text',
      content,
      attachments: null,
      is_read: true,
      read_at: now,
      created_at: now,
      updated_at: now,
      sender_name: CURRENT_ADMIN_NAME,
      sender_role: 'admin',
    };

    setMessages((current) => [...current, newMessage]);

    setConversations((current) =>
      current.map((item) =>
        item.id === selectedConversation.id
          ? {
              ...item,
              status: 'open',
              last_message_at: now,
              last_message_preview: content,
              updated_at: now,
              admin_unread_count: 0,
              assigned_admin_id:
                item.assigned_admin_id ?? CURRENT_ADMIN_ID,
              assigned_admin_name:
                item.assigned_admin_name ?? CURRENT_ADMIN_NAME,
            }
          : item,
      ),
    );
  };

  const handleAssignAdmin = (adminId: number | null) => {
    if (!selectedConversation) return;

    const adminNames: Record<number, string> = {
      1: 'Admin',
      2: 'Nhân viên CSKH',
    };

    setConversations((current) =>
      current.map((item) =>
        item.id === selectedConversation.id
          ? {
              ...item,
              assigned_admin_id: adminId,
              assigned_admin_name: adminId
                ? adminNames[adminId] ?? null
                : null,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const handleToggleStatus = () => {
    if (!selectedConversation) return;

    const nextStatus: ConversationStatus =
      selectedConversation.status === 'closed' ? 'open' : 'closed';

    setConversations((current) =>
      current.map((item) =>
        item.id === selectedConversation.id
          ? {
              ...item,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Hội thoại khách hàng
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Quản lý tin nhắn, phản hồi và phân công nhân viên chăm sóc khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Tổng hội thoại</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Đang xử lý</p>
          <p className="mt-2 text-2xl font-semibold text-accent-primary">
            {stats.open}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Chờ tiếp nhận</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Tin chưa đọc</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.unread}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ConversationList
          conversations={visibleConversations}
          selectedId={selectedId}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onSelect={handleSelectConversation}
        />

        {selectedConversation ? (
          <ConversationChat
            key={selectedConversation.id}
            conversation={selectedConversation}
            messages={selectedMessages}
            onSendMessage={handleSendMessage}
            onAssignAdmin={handleAssignAdmin}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface p-8 text-center">
            <MessageCircle size={42} className="text-text-muted" />
            <h2 className="mt-4 font-semibold text-text-primary">
              Chọn một hội thoại
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Chọn hội thoại bên trái để xem và trả lời tin nhắn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
