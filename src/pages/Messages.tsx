import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Conversation, Message } from '../types';
import { listenConversations, listenMessages, sendMessage } from '../services/messagesService';
import { Mail, MessageSquare, Users } from 'lucide-react';

export default function Messages() {
  const { currentUser, userData } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConversationId = searchParams.get('chat');

  useEffect(() => {
    if (!currentUser) return;
    setLoadingConversations(true);
    const unsubscribe = listenConversations(currentUser.uid, (data) => {
      setConversations(data);
      setLoadingConversations(false);

      if (requestedConversationId) {
        const target = data.find((conversation) => conversation.id === requestedConversationId);
        if (target) {
          setSelectedConversation(target);
          if (searchParams.has('chat')) {
            const params = new URLSearchParams(searchParams);
            params.delete('chat');
            setSearchParams(params, { replace: true });
          }
          return;
        }
      }

      if (!selectedConversation && data.length > 0) {
        setSelectedConversation(data[0]);
      }
    });
    return () => unsubscribe();
  }, [currentUser, requestedConversationId]);

  useEffect(() => {
    if (!selectedConversation) return;
    setLoadingMessages(true);
    const unsubscribe = listenMessages(selectedConversation.id, (data) => {
      setMessages(data);
      setLoadingMessages(false);
    });
    return () => unsubscribe();
  }, [selectedConversation]);

  const otherParticipantName = (conversation: Conversation) => {
    if (!currentUser) return 'Conversación';
    return (
      conversation.otherParticipant?.name ||
      conversation.metadata?.title ||
      conversation.metadata?.jobTitle ||
      'Conversación'
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
    return initials || 'CU';
  };

  const getLastMessageTime = (conversation: Conversation) => {
    const date = conversation.lastMessageAt || conversation.createdAt;
    if (!date) return '';
    return date.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !currentUser || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(
        selectedConversation.id,
        currentUser.uid,
        newMessage,
        userData?.name,
        userData?.photoUrl
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('No se pudo enviar el mensaje. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Debes iniciar sesión para ver tus mensajes.</p>
      </div>
    );
  }

  const conversationList = useMemo(() => {
    if (loadingConversations) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface rounded-2xl p-4 h-20" />
          ))}
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center text-text-secondary mt-8">
          <Users className="h-12 w-12 mx-auto mb-3 text-text-secondary" />
          No tienes conversaciones aún.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const isActive = selectedConversation?.id === conversation.id;
          const name = otherParticipantName(conversation);
          return (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full text-left p-4 rounded-2xl border shadow-sm transition ${
                isActive ? 'border-primary bg-primary-light/40' : 'border-border hover:bg-surface'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-sm font-semibold text-primary uppercase">
                  {conversation.otherParticipant?.photoUrl ? (
                    <img
                      src={conversation.otherParticipant.photoUrl}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text-primary truncate">{name}</p>
                    <span className="text-xs text-text-secondary">{getLastMessageTime(conversation)}</span>
                  </div>
                  <p className="text-sm text-text-secondary truncate">
                    {conversation.lastMessage || 'Inicia la conversación'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }, [conversations, loadingConversations, selectedConversation]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="card lg:col-span-1 xl:col-span-1 h-[75vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Conversaciones</h2>
            <p className="text-sm text-text-secondary">Historial entre empresas y estudiantes</p>
          </div>
          <span className="text-xs text-text-secondary">{conversations.length} chats</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">{conversationList}</div>
      </div>

      <div className="card lg:col-span-2 xl:col-span-2 h-[75vh] flex flex-col">
        {selectedConversation ? (
          <>
            <div className="border-b border-border pb-4 mb-4 flex items-center space-x-3">
              {selectedConversation.otherParticipant?.photoUrl ? (
                <img
                  src={selectedConversation.otherParticipant.photoUrl}
                  alt={otherParticipantName(selectedConversation)}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-sm font-semibold text-primary uppercase">
                  {getInitials(otherParticipantName(selectedConversation))}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {otherParticipantName(selectedConversation)}
                </h2>
                {selectedConversation.metadata?.jobTitle && (
                  <p className="text-sm text-text-secondary">
                    {selectedConversation.metadata.jobTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingMessages ? (
                <div className="text-center text-text-secondary mt-8">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-text-secondary mt-8">
                  <Mail className="h-12 w-12 mx-auto mb-3 text-text-secondary" />
                  Aún no hay mensajes en esta conversación.
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          message.senderId === currentUser.uid
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-primary'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-[10px] opacity-80 mt-1">
                          {message.createdAt.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className={`btn-primary px-4 py-2 flex items-center space-x-2 ${
                    sending ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{sending ? 'Enviando...' : 'Enviar'}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-text-secondary">
            <Mail className="h-12 w-12 mb-4" />
            Selecciona una conversación para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}

