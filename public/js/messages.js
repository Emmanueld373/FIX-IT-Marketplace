/**
 * Fix-it Marketplace — Messages Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatList = document.querySelector('#chat-conversations');
  const chatMessages = document.querySelector('#chat-message-history');
  const chatForm = document.querySelector('#chat-input-form');
  const chatInput = document.querySelector('#chat-input');

  const demoConversations = [
    {
      id: 'conv_1',
      name: 'Kofi Owusu (Cleaning Pro)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      lastMessage: "I'll be there tomorrow at 10:00 AM with all cleaning supplies.",
      time: '12:45 PM',
      messages: [
        { sender: 'them', text: 'Hello! Thanks for booking the deep home cleaning service.' },
        { sender: 'me', text: 'Hi Kofi! Just confirming: do you bring vacuum equipment?' },
        { sender: 'them', text: "Yes, I'll be there tomorrow at 10:00 AM with all cleaning supplies and industrial vacuum cleaners." }
      ]
    },
    {
      id: 'conv_2',
      name: 'Kwabena Mensah (Plumbing)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Let me know if the water pressure has stabilized.',
      time: 'Yesterday',
      messages: [
        { sender: 'them', text: 'Good day, please let me know if the water pressure has stabilized after the valve repair.' }
      ]
    }
  ];

  let activeConv = demoConversations[0];

  function renderConversations() {
    if (!chatList) return;
    chatList.innerHTML = demoConversations.map(c => `
      <div class="chat-conv-item ${c.id === activeConv.id ? 'active' : ''}" onclick="selectConversation('${c.id}')" style="display: flex; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; background: ${c.id === activeConv.id ? '#f4f9f5' : 'transparent'}; border: 1px solid ${c.id === activeConv.id ? '#008744' : 'transparent'};">
        <img src="${c.avatar}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
        <div style="flex: 1; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px; color: #222325;">${c.name}</strong>
            <span style="font-size: 11px; color: #74767e;">${c.time}</span>
          </div>
          <p style="font-size: 12px; color: #62646a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;">${c.lastMessage}</p>
        </div>
      </div>
    `).join('');
  }

  function renderMessages() {
    if (!chatMessages) return;
    chatMessages.innerHTML = activeConv.messages.map(m => `
      <div style="display: flex; justify-content: ${m.sender === 'me' ? 'flex-end' : 'flex-start'}; margin-bottom: 12px;">
        <div style="max-width: 70%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; background: ${m.sender === 'me' ? '#008744' : '#f0f2f5'}; color: ${m.sender === 'me' ? '#fff' : '#222325'};">
          ${m.text}
        </div>
      </div>
    `).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  window.selectConversation = (id) => {
    const found = demoConversations.find(c => c.id === id);
    if (found) {
      activeConv = found;
      renderConversations();
      renderMessages();
    }
  };

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      activeConv.messages.push({ sender: 'me', text });
      activeConv.lastMessage = text;
      chatInput.value = '';
      renderMessages();
      renderConversations();
    });
  }

  renderConversations();
  renderMessages();
});
