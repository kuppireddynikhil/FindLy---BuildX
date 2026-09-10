import { supabase } from '../lib/supabase';

export type ConversationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'DECLINED'
  | 'REVOKED'
  | 'CLOSED'
  | 'EXPIRED';

export interface Conversation {
  id: string;
  report_id?: string;
  requester_id: string;
  reporter_id: string;
  status: ConversationStatus;
  requester_message_count: number;
  created_at: string;
  updated_at: string;
  report_title?: string;
  other_party?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  last_message?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export const messagingService = {
  // 1. Fetch conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`requester_id.eq.${userId},reporter_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        // Hydrate other party details
        const enriched = await Promise.all(
          data.map(async (conv: any) => {
            const otherPartyId = conv.requester_id === userId ? conv.reporter_id : conv.requester_id;
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, role')
              .eq('id', otherPartyId)
              .maybeSingle();

            // Fetch report title if attached
            let reportTitle = 'Campus Lost & Found Inquiry';
            if (conv.report_id) {
              const { data: report } = await supabase
                .from('reports')
                .select('title')
                .eq('id', conv.report_id)
                .maybeSingle();
              if (report) reportTitle = report.title;
            }

            return {
              ...conv,
              report_title: reportTitle,
              other_party: profile || {
                id: otherPartyId,
                full_name: 'Campus User',
              },
            };
          })
        );
        return enriched;
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    return [];
  },

  // 2. Fetch messages for conversation
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as ChatMessage[];
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
    return [];
  },

  // 3. Create or find conversation
  async createOrGetConversation(
    reportId: string,
    requesterId: string,
    reporterId: string
  ): Promise<{ id: string; status: ConversationStatus }> {
    try {
      // Check existing
      const { data: existing } = await supabase
        .from('conversations')
        .select('id, status')
        .eq('report_id', reportId)
        .eq('requester_id', requesterId)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            report_id: reportId,
            requester_id: requesterId,
            reporter_id: reporterId,
            status: 'PENDING',
            requester_message_count: 0,
          },
        ])
        .select('id, status')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error in createOrGetConversation:', err);
      throw err;
    }
  },

  // 4. Send message (enforcing server-side 2-message preliminary limit)
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachmentUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Try RPC first for strict server-side enforcement
      const { error } = await supabase.rpc('send_conversation_message', {
        p_conversation_id: conversationId,
        p_sender_id: senderId,
        p_content: content,
        p_attachment_url: attachmentUrl || null,
      });

      if (error) {
        // Check if error is because RPC doesn't exist yet
        if (error.code === 'PGRST202' || error.message.includes('function')) {
          // Direct fallback with client verification
          const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

          if (conv) {
            if (conv.status === 'DECLINED' || conv.status === 'REVOKED' || conv.status === 'CLOSED') {
              return { success: false, error: 'Chat access has been revoked.' };
            }
            if (conv.status === 'PENDING' && conv.requester_id === senderId && conv.requester_message_count >= 2) {
              return {
                success: false,
                error: 'Preliminary limit of 2 messages reached. Awaiting finder response before further messages can be sent.',
              };
            }

            // Insert message
            await supabase.from('messages').insert([
              {
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                attachment_url: attachmentUrl,
              },
            ]);

            // Update conversation
            const updates: any = { updated_at: new Date().toISOString() };
            if (conv.requester_id === senderId) {
              updates.requester_message_count = (conv.requester_message_count || 0) + 1;
            } else if (conv.status === 'PENDING') {
              updates.status = 'ACTIVE';
            }
            await supabase.from('conversations').update(updates).eq('id', conversationId);

            return { success: true };
          }
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message.';
      return { success: false, error: msg };
    }
  },

  // 5. Accept conversation
  async acceptConversation(conversationId: string, actorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('accept_conversation', {
        p_conversation_id: conversationId,
        p_actor_id: actorId,
      });
      if (error) {
        await supabase
          .from('conversations')
          .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
      return true;
    } catch {
      return false;
    }
  },

  // 6. Decline conversation
  async declineConversation(conversationId: string, actorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('decline_conversation', {
        p_conversation_id: conversationId,
        p_actor_id: actorId,
      });
      if (error) {
        await supabase
          .from('conversations')
          .update({ status: 'DECLINED', updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
      return true;
    } catch {
      return false;
    }
  },

  // 7. Revoke conversation
  async revokeConversation(conversationId: string, actorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('revoke_conversation', {
        p_conversation_id: conversationId,
        p_actor_id: actorId,
      });
      if (error) {
        await supabase
          .from('conversations')
          .update({ status: 'REVOKED', updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
      return true;
    } catch {
      return false;
    }
  },
};
