(() => {
  const cfg = window.CAPITAL_CONFIG || {};
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  };
  const phone = String(cfg.whatsappNumber || '918340712432').replace(/\D/g, '');
  const email = cfg.contactEmail || 'realestatethecapital01@gmail.com';
  const geminiUrl = cfg.geminiUrl || 'https://gemini.google.com/app';

  document.getElementById('year')?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));

  // Mobile navigation.
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  menuBtn?.addEventListener('click', () => nav?.classList.toggle('open'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // Listing tabs filter.
  const cards = [...document.querySelectorAll('#cards .card')];
  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    let shown = 0;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.purpose === f;
      card.hidden = !show;
      if (show) shown++;
    });
    const empty = document.getElementById('empty');
    if (empty) empty.hidden = shown !== 0;
  }));

  const openWhatsApp = (message) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  document.querySelectorAll('.enquire').forEach(btn => btn.addEventListener('click', () => {
    openWhatsApp(`Hello The Capital Real Estate, I am interested in: ${btn.dataset.name || 'a property'}. Please share details.`);
  }));
  document.getElementById('wa')?.addEventListener('click', () => openWhatsApp('Hello The Capital Real Estate, I would like to enquire about a property.'));
  const geminiPanel = document.getElementById('geminiPanel');
  document.getElementById('gemini')?.addEventListener('click', () => {
    if (geminiPanel) geminiPanel.hidden = !geminiPanel.hidden;
    const input = document.getElementById('geminiInput');
    if (geminiPanel && !geminiPanel.hidden) setTimeout(() => input?.focus(), 50);
  });
  document.getElementById('closeGemini')?.addEventListener('click', () => { if (geminiPanel) geminiPanel.hidden = true; });
  document.querySelectorAll('.gemini-quick [data-prompt]').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById('geminiInput');
    if (input) { input.value = btn.dataset.prompt || ''; input.focus(); }
  }));
  const chatHistory = [];
  const addChatMessage = (text, role) => {
    const messages = document.getElementById('geminiMessages');
    if (!messages) return null;
    const node = document.createElement('div');
    node.className = role === 'user' ? 'user-msg' : 'assistant-msg';
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  };
  document.getElementById('geminiForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('geminiInput');
    const send = document.querySelector('#geminiForm button[type="submit"]');
    const question = (input?.value || '').trim();
    if (!question) return;
    addChatMessage(question, 'user');
    chatHistory.push({ role: 'user', text: question });
    input.value = '';
    if (send) { send.disabled = true; send.textContent = '…'; }
    const pending = addChatMessage('Thinking…', 'assistant');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory.slice(-12) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Assistant is not available right now.');
      if (pending) pending.textContent = result.reply || 'I could not generate a reply. Please try again.';
      chatHistory.push({ role: 'assistant', text: result.reply || '' });
    } catch (err) {
      if (pending) pending.textContent = `${err.message} If you are testing by opening index.html directly, run the website through the Node server or deploy it on Render.`;
      chatHistory.pop();
    } finally {
      if (send) { send.disabled = false; send.textContent = 'Send'; }
      input?.focus();
    }
  });

 // Submit property enquiries to Netlify Forms.
const form = document.getElementById('contactForm');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.reportValidity()) return;

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }

  try {
    const formData = new FormData(form);
    formData.set('form-name', 'property-enquiry');

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });

    if (!response.ok) throw new Error('Submission failed');

    form.reset();
    showToast('Thank you! Your enquiry has been submitted.');
  } catch (error) {
    showToast('Enquiry could not be submitted. Please contact us on WhatsApp.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Prepare enquiry ↗';
    }
  }
});

  // Drag floating contact buttons with mouse or touch. Tap/click still activates the button.
  document.querySelectorAll('.drag-handle').forEach(button => {
    let startX = 0, startY = 0, originX = 0, originY = 0, moved = false;
    button.addEventListener('pointerdown', (e) => {
      startX = e.clientX; startY = e.clientY; moved = false;
      const r = button.getBoundingClientRect();
      originX = r.left; originY = r.top;
      button.setPointerCapture?.(e.pointerId);
    });
    button.addEventListener('pointermove', (e) => {
      if (!button.hasPointerCapture?.(e.pointerId)) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 7) moved = true;
      if (!moved) return;
      const x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, originX + dx));
      const y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, originY + dy));
      button.style.position = 'fixed';
      button.style.left = `${x}px`; button.style.top = `${y}px`;
      button.style.right = 'auto'; button.style.bottom = 'auto';
    });
    button.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; }
    }, true);
  });
})();
