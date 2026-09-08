/**
 * Fix-it Marketplace — Real-Time Messages Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const chatList = document.querySelector('#chat-conversations');
  const chatMessages = document.querySelector('#chat-message-history');
  const chatForm = document.querySelector('#chat-input-form');
  const chatInput = document.querySelector('#chat-input');

  let activeConv = null;
  let conversations = [];
  let pollInterval = null;

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const targetRecipientId = urlParams.get('recipientId') || urlParams.get('providerId');
  const targetRecipientName = urlParams.get('recipientName') || urlParams.get('providerName');
  const targetServiceTitle = urlParams.get('serviceTitle') || '';
  const targetBookingId = urlParams.get('bookingId') || '';

  // Get current user
  function getCurrentUser() {
    return Auth.getUser() || {
      id: 'guest_' + (localStorage.getItem('fixit_guest_id') || Math.random().toString(36).substring(2, 8)),
      fullName: 'Customer',
      primaryEmail: ''
    };
  }

  // Fetch conversations from server
  async function loadConversations() {
    const user = getCurrentUser();
    try {
      const res = await API.request(`/messages/conversations?userId=${encodeURIComponent(user.id)}`).catch(() => null);
      if (res && res.conversations) {
        conversations = res.conversations;
      }
    } catch (err) {
      console.warn('Could not load conversations from API:', err);
    }

    // If a recipient was specified via URL, ensure a conversation exists
    if (targetRecipientName && !conversations.some(c => c.name.toLowerCase() === targetRecipientName.toLowerCase())) {
      const newConvKey = [user.id, targetRecipientId || 'provider'].sort().join('_');
      const initiated = {
        id: newConvKey,
        otherId: targetRecipientId || 'provider',
        name: targetRecipientName,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        lastMessage: targetServiceTitle ? `Inquiry regarding ${targetServiceTitle}` : 'Hello! How can I help you?',
        time: 'Just now',
        messages: [
          {
            sender: 'them',
            senderName: targetRecipientName,
            text: `Hello! Thanks for reaching out regarding ${targetServiceTitle || 'our services'}. How can I assist you today?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      conversations.unshift(initiated);
      activeConv = initiated;
    }

    if (!activeConv && conversations.length > 0) {
      activeConv = conversations[0];
    }

    renderConversations();
    renderMessages();
  }

  // Render left conversation list
  function renderConversations() {
    if (!chatList) return;

    if (conversations.length === 0) {
      chatList.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: #74767e; font-size: 13px;">
          <i class="fa-regular fa-comments" style="font-size: 28px; margin-bottom: 8px; display: block; color: #b5b6ba;"></i>
          No messages yet.<br>Click "Message Provider" on any service or booking to start a conversation.
        </div>
      `;
      return;
    }

    chatList.innerHTML = conversations.map(c => `
      <div class="chat-conv-item ${activeConv && c.id === activeConv.id ? 'active' : ''}" onclick="selectConversation('${c.id}')" style="display: flex; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; background: ${activeConv && c.id === activeConv.id ? '#f4f9f5' : 'transparent'}; border: 1px solid ${activeConv && c.id === activeConv.id ? '#008744' : 'transparent'}; margin-bottom: 4px; transition: background 0.15s ease;">
        <img src="${c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';" />
        <div style="flex: 1; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px; color: #222325;">${c.name}</strong>
            <span style="font-size: 11px; color: #74767e;">${c.time || ''}</span>
          </div>
          <p style="font-size: 12px; color: #62646a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;">${c.lastMessage || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // Render chat history
  function renderMessages() {
    if (!chatMessages) return;

    if (!activeConv || !activeConv.messages || activeConv.messages.length === 0) {
      chatMessages.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #74767e; text-align: center;">
          <i class="fa-regular fa-paper-plane" style="font-size: 36px; margin-bottom: 12px; color: #008744;"></i>
          <h3 style="font-size: 16px; font-weight: 700; color: #222325; margin-bottom: 4px;">Direct Real-Time Chat</h3>
          <p style="font-size: 13px; max-width: 320px;">Send a message below to coordinate scheduling, request quotes, or get job updates.</p>
        </div>
      `;
      return;
    }

    chatMessages.innerHTML = activeConv.messages.map(m => {
      const isMe = m.sender === 'me';
      return `
        <div style="display: flex; justify-content: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom: 14px;">
          <div style="max-width: 72%;">
            <div style="font-size: 11px; color: #74767e; margin-bottom: 2px; text-align: ${isMe ? 'right' : 'left'};">
              ${isMe ? 'You' : (m.senderName || activeConv.name)} · ${m.time || ''}
            </div>
            <div style="padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; background: ${isMe ? '#008744' : '#ffffff'}; color: ${isMe ? '#ffffff' : '#222325'}; box-shadow: 0 1px 2px rgba(0,0,0,0.06); border: ${isMe ? 'none' : '1px solid #e4e5e7'};">
              ${m.text}
            </div>
          </div>
        </div>
      `;
    }).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Select conversation
  window.selectConversation = (id) => {
    const found = conversations.find(c => c.id === id);
    if (found) {
      activeConv = found;
      renderConversations();
      renderMessages();
    }
  };

  // Send message
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      const user = getCurrentUser();
      const recipientName = activeConv ? activeConv.name : (targetRecipientName || 'Fix-it Pro');
      const recipientId = activeConv ? activeConv.otherId : (targetRecipientId || 'provider');

      const newMsg = {
        sender: 'me',
        senderName: user.fullName,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!activeConv) {
        const newKey = [user.id, recipientId].sort().join('_');
        activeConv = {
          id: newKey,
          otherId: recipientId,
          name: recipientName,
          lastMessage: text,
          time: 'Just now',
          messages: []
        };
        conversations.unshift(activeConv);
      }

      activeConv.messages.push(newMsg);
      activeConv.lastMessage = text;
      activeConv.time = 'Just now';
      chatInput.value = '';

      renderMessages();
      renderConversations();

      // Post to real-time backend API
      try {
        await API.request('/messages', {
          method: 'POST',
          body: JSON.stringify({
            senderId: user.id,
            senderName: user.fullName,
            recipientId: recipientId,
            recipientName: recipientName,
            text: text,
            serviceTitle: targetServiceTitle,
            bookingId: targetBookingId
          })
        });
      } catch (err) {
        console.warn('Message saved locally, server async notice:', err);
      }
    });
  }

  // Initialize
  await loadConversations();

  // Poll for new messages every 3.5 seconds
  pollInterval = setInterval(async () => {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    try {
      const res = await API.request(`/messages/conversations?userId=${encodeURIComponent(user.id)}`).catch(() => null);
      if (res && res.conversations && res.conversations.length > 0) {
        conversations = res.conversations;
        if (activeConv) {
          const updatedActive = conversations.find(c => c.id === activeConv.id);
          if (updatedActive && updatedActive.messages?.length !== activeConv.messages?.length) {
            activeConv = updatedActive;
            renderMessages();
          }
        }
        renderConversations();
      }
    } catch (_) {}
  }, 3500);

  window.addEventListener('beforeunload', () => {
    if (pollInterval) clearInterval(pollInterval);
  });
});
