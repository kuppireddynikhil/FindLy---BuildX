import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { messagingService } from '../services/messagingService';
import type { Conversation, ChatMessage } from '../services/messagingService';
import { StatusBadge, EmptyState, LoadingSkeleton } from '../components/ui/ArcticPearlComponents';
import { useToast } from '../components/ui/Toast';
import {
  Send,
  Clock,
  Lock,
  AlertCircle
} from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetConvId = searchParams.get('conversation');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    const convs = await messagingService.getConversations(user.id);
    setConversations(convs);

    if (convs.length > 0) {
      if (targetConvId) {
        const found = convs.find((c) => c.id === targetConvId);
        setActiveConv(found || convs[0]);
      } else {
        setActiveConv(convs[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, [user, targetConvId]);

  useEffect(() => {
    if (!activeConv) return;
    async function fetchMessages() {
      const msgs = await messagingService.getMessages(activeConv!.id);
      setMessages(msgs);
    }
    fetchMessages();
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConv || !messageInput.trim()) return;

    setSending(true);
    const res = await messagingService.sendMessage(activeConv.id, user.id, messageInput.trim());

    if (!res.success) {
      addToast(res.error || 'Could not send message.', 'error');
    } else {
      setMessageInput('');
      const updatedMsgs = await messagingService.getMessages(activeConv.id);
      setMessages(updatedMsgs);
      loadConversations();
    }
    setSending(false);
  };

  const handleAccept = async () => {
    if (!user || !activeConv) return;
    const ok = await messagingService.acceptConversation(activeConv.id, user.id);
    if (ok) {
      addToast('Conversation accepted! You can now chat freely.', 'success');
      loadConversations();
    } else {
      addToast('Failed to accept conversation.', 'error');
    }
  };

  const handleDecline = async () => {
    if (!user || !activeConv) return;
    const ok = await messagingService.declineConversation(activeConv.id, user.id);
    if (ok) {
      addToast('Conversation declined.', 'info');
      loadConversations();
    }
  };

  const handleRevoke = async () => {
    if (!user || !activeConv) return;
    if (!confirm('Are you sure you want to revoke chat access for this conversation?')) return;
    const ok = await messagingService.revokeConversation(activeConv.id, user.id);
    if (ok) {
      addToast('Chat access has been revoked.', 'info');
      loadConversations();
    }
  };

  const isRequester = user && activeConv && user.id === activeConv.requester_id;
  const isPending = activeConv?.status === 'PENDING';
  const isRevoked = activeConv?.status === 'REVOKED' || activeConv?.status === 'DECLINED' || activeConv?.status === 'CLOSED';
  const requesterLimitReached = isRequester && isPending && (activeConv?.preliminary_message_count || 0) >= 2;

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Controlled Campus Messaging</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Verified, secure communication between item claimants, finders, and campus moderators
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : conversations.length === 0 ? (
          <EmptyState
            title="No messages yet."
            description="You don't have any active communication threads. When you reach out regarding an item or someone contacts you, the conversation will appear here."
            actionLabel="Explore Campus Feed"
            onAction={() => (window.location.href = '/home')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-xl border border-border-default shadow-card overflow-hidden min-h-[600px]">
            {/* Conversation Threads Sidebar */}
            <aside className="border-r border-border-default flex flex-col">
              <div className="p-3.5 border-b border-border-default bg-surface-subtle">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Conversations ({conversations.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border-default">
                {conversations.map((conv) => {
                  const isActive = activeConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConv(conv);
                        setSearchParams({ conversation: conv.id });
                      }}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-primary-50/80 border-l-4 border-primary-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-text-primary truncate">
                          {conv.other_party?.full_name || 'Campus User'}
                        </span>
                        <StatusBadge status={conv.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-primary-700 font-medium truncate mb-0.5">
                        {conv.report_title}
                      </p>
                      <span className="text-[10px] text-text-disabled">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Chat Pane */}
            <main className="md:col-span-2 flex flex-col justify-between">
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border-default bg-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">
                          {activeConv.other_party?.full_name || 'Campus User'}
                        </h3>
                        <StatusBadge status={activeConv.status} size="sm" />
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Regarding: <span className="font-semibold text-text-primary">{activeConv.report_title}</span>
                      </p>
                    </div>

                    {!isRevoked && (
                      <button
                        onClick={handleRevoke}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>

                  {/* Responder Accept / Decline Banner */}
                  {!isRequester && isPending && (
                    <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>This claimant has sent a message request. Accept to enable full chat.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAccept}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={handleDecline}
                          className="px-3 py-1 bg-white border border-border-default text-text-secondary hover:bg-slate-100 rounded text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2-Message Preliminary Limit Warning Banner */}
                  {isRequester && isPending && (
                    <div className="p-3 bg-[#EEF5FF] border-b border-[#DCEAFF] text-xs text-primary-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary-600" />
                        Preliminary Limit: {activeConv.preliminary_message_count}/2 messages sent.
                      </span>
                      <span className="text-[11px] font-medium text-text-secondary">
                        Awaiting responder acceptance
                      </span>
                    </div>
                  )}

                  {/* Revoked State Banner */}
                  {isRevoked && (
                    <div className="p-3 bg-[#FCEBEB] border-b border-[#F8D2D2] text-xs text-error font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Chat access has been revoked. History is read-only.</span>
                    </div>
                  )}

                  {/* Messages Bubble Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-subtle/40">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-text-disabled italic py-12">
                        No messages in this thread yet. Send the first message below.
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = user?.id === m.sender_id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-sm rounded-xl px-4 py-2.5 text-xs shadow-sm ${
                                isMe
                                  ? 'bg-primary-500 text-white rounded-br-none'
                                  : 'bg-white text-text-primary border border-border-default rounded-bl-none'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                              {m.attachment_url && (
                                <img
                                  src={m.attachment_url}
                                  alt="Attachment"
                                  className="mt-2 rounded-md max-h-36 object-cover"
                                />
                              )}
                            </div>
                            <span className="text-[10px] text-text-disabled mt-1 px-1">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input Bar */}
                  <div className="p-3.5 border-t border-border-default bg-white">
                    {isRevoked ? (
                      <div className="p-2 text-center text-xs text-text-disabled font-medium bg-slate-50 rounded">
                        Chat is locked. You cannot send messages in this conversation.
                      </div>
                    ) : requesterLimitReached ? (
                      <div className="p-2 text-center text-xs text-warning font-medium bg-amber-50 rounded border border-amber-200">
                        Preliminary limit reached (2 messages maximum). Please wait for the finder to accept.
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
                        />
                        <button
                          type="submit"
                          disabled={sending || !messageInput.trim()}
                          className="p-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-md transition-colors"
                          title="Send Message"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-text-disabled">
                  Select a conversation from the left to read messages.
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
