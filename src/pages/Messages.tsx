import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Conversation, Message } from '../types';
import { listenConversations, listenMessages, sendMessage } from '../services/messagesService';
import { Mail, MessageSquare, Users, ChevronLeft } from 'lucide-react';

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
  const [showChat, setShowChat] = useState(false); // Para alternar vista en móviles

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
          // Si es móvil, mostrar el chat automáticamente
          if (window.innerWidth < 1024) {
            setShowChat(true);
          }
          if (searchParams.has('chat')) {
            const params = new URLSearchParams(searchParams);
            params.delete('chat');
            setSearchParams(params, { replace: true });
          }
          return;
        }
      }

      if (!selectedConversation && data.length > 0) {
        // Solo auto-seleccionar primera conversación en desktop
        if (window.innerWidth >= 1024) {
          setSelectedConversation(data[0]);
        }
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

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // En móviles, mostrar el chat al seleccionar una conversación
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const conversationList = useMemo(() => {
    if (loadingConversations) {
      return (
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface rounded-xl sm:rounded-2xl p-3 sm:p-4 h-16 sm:h-20" />
          ))}
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center text-text-secondary mt-8 px-4">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-text-secondary" />
          <p className="text-sm sm:text-base">No tienes conversaciones aún.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 sm:space-y-3">
        {conversations.map((conversation) => {
          const isActive = selectedConversation?.id === conversation.id;
          const name = otherParticipantName(conversation);
          return (
            <button
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border shadow-sm transition touch-manipulation ${
                isActive ? 'border-primary bg-primary-light/40' : 'border-border hover:bg-surface active:bg-surface'
              }`}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface flex items-center justify-center text-xs sm:text-sm font-semibold text-primary uppercase flex-shrink-0">
                  {conversation.otherParticipant?.photoUrl ? (
                    <img
                      src={conversation.otherParticipant.photoUrl}
                      alt={name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm sm:text-base text-text-primary truncate">{name}</p>
                    <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">{getLastMessageTime(conversation)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary truncate">
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

  // Hook para detectar tamaño de pantalla
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Vista móvil: alternar entre lista y chat */}
      {isMobile && (
        <>
          {!showChat ? (
            // Lista de conversaciones en móvil
            <div className="card h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex flex-col p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Conversaciones</h2>
                  <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Historial entre empresas y estudiantes</p>
                </div>
                <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">{conversations.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                {conversationList}
              </div>
            </div>
          ) : (
            // Chat seleccionado en móvil
            <div className="card h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex flex-col p-4 sm:p-6">
              {selectedConversation && (
                <>
                  {/* Header del chat con botón volver */}
                  <div className="border-b border-border pb-3 sm:pb-4 mb-3 sm:mb-4 flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={handleBackToList}
                      className="p-2 rounded-md hover:bg-surface touch-manipulation lg:hidden"
                      aria-label="Volver a conversaciones"
                    >
                      <ChevronLeft className="h-5 w-5 text-text-primary" />
                    </button>
                    {selectedConversation.otherParticipant?.photoUrl ? (
                      <img
                        src={selectedConversation.otherParticipant.photoUrl}
                        alt={otherParticipantName(selectedConversation)}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface flex items-center justify-center text-xs sm:text-sm font-semibold text-primary uppercase flex-shrink-0">
                        {getInitials(otherParticipantName(selectedConversation))}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-xl font-semibold truncate">
                        {otherParticipantName(selectedConversation)}
                      </h2>
                      {selectedConversation.metadata?.jobTitle && (
                        <p className="text-xs sm:text-sm text-text-secondary truncate">
                          {selectedConversation.metadata.jobTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Área de mensajes */}
                  <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 mb-3 sm:mb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {loadingMessages ? (
                      <div className="text-center text-text-secondary mt-8 text-sm">Cargando mensajes...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-text-secondary mt-8 px-4">
                        <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-text-secondary" />
                        <p className="text-xs sm:text-sm">Aún no hay mensajes en esta conversación.</p>
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
                              className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                message.senderId === currentUser.uid
                                  ? 'bg-primary text-white'
                                  : 'bg-surface text-text-primary'
                              }`}
                            >
                              <p className="break-words">{message.text}</p>
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

                  {/* Input de mensaje */}
                  <div className="border-t border-border pt-3 sm:pt-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
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
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base touch-manipulation"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className={`btn-primary px-3 sm:px-4 py-2.5 sm:py-2 flex items-center space-x-1 sm:space-x-2 text-sm touch-manipulation whitespace-nowrap ${
                          sending || !newMessage.trim() ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">{sending ? 'Enviando...' : 'Enviar'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Vista desktop: lista y chat lado a lado */}
      {!isMobile && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] xl:h-[75vh]">
          {/* Lista de conversaciones */}
          <div className="card xl:col-span-1 h-full flex flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Conversaciones</h2>
                <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Historial entre empresas y estudiantes</p>
              </div>
              <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">{conversations.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {conversationList}
            </div>
          </div>

          {/* Área de chat */}
          <div className="card xl:col-span-2 h-full flex flex-col p-4 sm:p-6">
            {selectedConversation ? (
              <>
                {/* Header del chat */}
                <div className="border-b border-border pb-3 sm:pb-4 mb-3 sm:mb-4 flex items-center space-x-2 sm:space-x-3">
                  {selectedConversation.otherParticipant?.photoUrl ? (
                    <img
                      src={selectedConversation.otherParticipant.photoUrl}
                      alt={otherParticipantName(selectedConversation)}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface flex items-center justify-center text-xs sm:text-sm font-semibold text-primary uppercase flex-shrink-0">
                      {getInitials(otherParticipantName(selectedConversation))}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-xl font-semibold truncate">
                      {otherParticipantName(selectedConversation)}
                    </h2>
                    {selectedConversation.metadata?.jobTitle && (
                      <p className="text-xs sm:text-sm text-text-secondary truncate">
                        {selectedConversation.metadata.jobTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 mb-3 sm:mb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {loadingMessages ? (
                    <div className="text-center text-text-secondary mt-8 text-sm">Cargando mensajes...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-text-secondary mt-8 px-4">
                      <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-text-secondary" />
                      <p className="text-xs sm:text-sm">Aún no hay mensajes en esta conversación.</p>
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
                            className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                              message.senderId === currentUser.uid
                                ? 'bg-primary text-white'
                                : 'bg-surface text-text-primary'
                            }`}
                          >
                            <p className="break-words">{message.text}</p>
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

                {/* Input de mensaje */}
                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
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
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base touch-manipulation"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`btn-primary px-3 sm:px-4 py-2.5 sm:py-2 flex items-center space-x-1 sm:space-x-2 text-sm touch-manipulation whitespace-nowrap ${
                        sending || !newMessage.trim() ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{sending ? 'Enviando...' : 'Enviar'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-text-secondary px-4">
                <Mail className="h-10 w-10 sm:h-12 sm:w-12 mb-4" />
                <p className="text-sm sm:text-base text-center">Selecciona una conversación para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

