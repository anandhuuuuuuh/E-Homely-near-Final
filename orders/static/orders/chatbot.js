// E-Homely chatbot (Django version). Answers come from /chat/ so they always
// match the real meal times, prices and stock.
class EhomelyChatbot {
  constructor() {
    this.isOpen = false;
    this.render();
    this.bind();
    this.say('Hi! Welcome to E-Homely. Ask me about meal timings, prices, payment or how to order.', 'bot');
  }

  render() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="ehomelyChat" class="eho-chatbot-widget">
        <button class="chat-toggle" id="chatToggle" type="button" aria-label="Open chat" title="Chat with us">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span class="chat-badge" id="chatBadge">1</span>
        </button>
        <div class="chat-window" id="chatWindow" style="display:none">
          <div class="chat-header">
            <div class="chat-title"><span class="title-text">E-Homely Chat</span><small>Instant support</small></div>
            <button class="chat-close" id="chatClose" type="button" aria-label="Close chat">&times;</button>
          </div>
          <div class="chat-messages" id="chatMessages"></div>
          <div class="chat-input-area">
            <input type="text" id="chatInput" class="chat-input" placeholder="Ask about menu, orders, payment..." autocomplete="off" maxlength="200">
            <button class="chat-send" id="chatSend" type="button" aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <div class="chat-suggestions">
            <button class="suggestion-btn" type="button" data-query="What's available now?">Available now?</button>
            <button class="suggestion-btn" type="button" data-query="How to order?">How to order</button>
            <button class="suggestion-btn" type="button" data-query="How does payment work?">Payment</button>
            <button class="suggestion-btn" type="button" data-query="Contact support">Support</button>
          </div>
        </div>
      </div>`);
  }

  bind() {
    const $ = id => document.getElementById(id);
    this.input = $('chatInput');
    $('chatToggle').addEventListener('click', () => this.toggle());
    $('chatClose').addEventListener('click', () => this.toggle());
    $('chatSend').addEventListener('click', () => this.send(this.input.value));
    this.input.addEventListener('keydown', e => { if (e.key === 'Enter') this.send(this.input.value); });
    document.querySelectorAll('.suggestion-btn').forEach(b =>
      b.addEventListener('click', () => this.send(b.dataset.query)));
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatWindow').style.display = this.isOpen ? 'flex' : 'none';
    document.getElementById('chatBadge').style.display = 'none';
    if (this.isOpen) this.input.focus();
  }

  say(text, who) {
    const box = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'chat-message ' + who;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    return bubble;
  }

  async send(text) {
    text = (text || '').trim();
    if (!text) return;
    this.input.value = '';
    this.say(text, 'user');
    const bubble = this.say('...', 'bot');
    try {
      const res = await fetch(window.CHAT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': window.CHAT_CSRF},
        body: JSON.stringify({message: text}),
      });
      bubble.textContent = (await res.json()).reply;
    } catch (e) {
      bubble.textContent = 'Sorry, I could not connect. Please try again.';
    }
    const box = document.getElementById('chatMessages');
    box.scrollTop = box.scrollHeight;
  }
}
document.addEventListener('DOMContentLoaded', () => new EhomelyChatbot());
