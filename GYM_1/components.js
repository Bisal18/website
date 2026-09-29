const Components = {
  navbar: `
    <nav class="navbar">
      <div class="container nav-container">
        <a href="index.html" class="logo">NEON<span class="gradient-text">FORGE</span></a>
        <button class="mobile-menu-btn" aria-label="Toggle Menu">☰</button>
        <div class="nav-links">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="classes.html">Classes</a>
          <a href="timetable.html">Schedule</a>
          <a href="trainers.html">Trainers</a>
          <a href="pricing.html">Pricing</a>
          <a href="tools.html">Tools</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
    </nav>
  `,
  footer: `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div>
            <h3>NEON<span class="gradient-text">FORGE</span></h3>
            <p style="color: var(--text-muted); margin-top: 15px;">Jubilee Hills, Hyderabad, Telangana<br>Mon-Sat 5 AM - 10 PM<br>Sun 7 AM - 1 PM</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul style="color: var(--text-muted); line-height: 2;">
              <li><a href="transformations.html">Transformations</a></li>
              <li><a href="testimonials.html">Reviews</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="faq.html">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul style="color: var(--text-muted); line-height: 2;">
              <li>+91 98765 43210</li>
              <li>hello@neonforge.fit</li>
            </ul>
          </div>
        </div>
        <div style="text-align: center; color: var(--text-muted); border-top: 1px solid var(--glass-border); padding-top: 20px;">
          &copy; 2026 NeonForge Fitness. All rights reserved.
        </div>
      </div>
    </footer>
  `,
  stickyNote: `
    <div class="sticky-note-wrapper" id="draggable-note">
      <div class="note-controls">
        <button class="note-btn" id="flip-note" aria-label="Flip Note">↻</button>
        <button class="note-btn" id="min-note" aria-label="Minimize Note">_</button>
      </div>
      <div class="sticky-note" id="note-card">
        <div class="note-face">
          <div class="note-pin"></div>
          <h4 style="font-size: 1.2rem; margin-bottom: 10px;">First 3 Days FREE!</h4>
          <p style="font-size: 0.8rem; margin-bottom: 15px;">Experience the future of fitness today.</p>
          <a href="contact.html" class="btn-glow" style="padding: 8px 15px; font-size: 0.8rem;">Claim Now</a>
        </div>
        <div class="note-back">
          <div class="note-pin"></div>
          <h4 style="font-size: 1.1rem; margin-bottom: 10px;">Quote of the Day</h4>
          <p style="font-size: 0.85rem; font-style: italic;">"What seems impossible today will one day become your warm-up."</p>
        </div>
      </div>
    </div>
  `,

  init() {
    // Inject Layout
    document.body.insertAdjacentHTML('afterbegin', this.navbar);
    document.body.insertAdjacentHTML('beforeend', this.footer + this.stickyNote);

    // Active Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      if(link.getAttribute('href') === currentPage) link.style.color = 'var(--accent-2)';
    });

    // Mobile Menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
      document.querySelector('.nav-links').classList.toggle('active');
    });

    this.initStickyNote();
  },

  initStickyNote() {
    const wrapper = document.getElementById('draggable-note');
    const noteCard = document.getElementById('note-card');
    const flipBtn = document.getElementById('flip-note');
    const minBtn = document.getElementById('min-note');

    // Restore State
    try {
      const state = JSON.parse(localStorage.getItem('neonForgeNoteState')) || {};
      if (state.minimized) wrapper.classList.add('minimized');
      if (state.pos) { wrapper.style.left = state.pos.x; wrapper.style.top = state.pos.y; wrapper.style.bottom = 'auto'; wrapper.style.right = 'auto'; }
    } catch(e) { console.error("Note state error:", e); }

    const saveState = () => {
      localStorage.setItem('neonForgeNoteState', JSON.stringify({
        minimized: wrapper.classList.contains('minimized'),
        pos: { x: wrapper.style.left, y: wrapper.style.top }
      }));
    };

    // Flip & Minimize
    flipBtn.addEventListener('click', (e) => { e.stopPropagation(); noteCard.classList.toggle('flipped'); });
    minBtn.addEventListener('click', (e) => { e.stopPropagation(); wrapper.classList.toggle('minimized'); saveState(); });

    // Dragging Logic
    let isDragging = false, startX, startY, initialX, initialY;
    wrapper.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // Touch support
    wrapper.addEventListener('touchstart', (e) => dragStart(e.touches[0]));
    document.addEventListener('touchmove', (e) => { if(isDragging) { e.preventDefault(); drag(e.touches[0]); }}, {passive: false});
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      if(e.target.closest('.note-controls') || e.target.closest('a')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = wrapper.getBoundingClientRect();
      initialX = rect.left; initialY = rect.top;
      wrapper.style.transition = 'none';
    }
    function drag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX; const dy = e.clientY - startY;
      wrapper.style.left = `${initialX + dx}px`;
      wrapper.style.top = `${initialY + dy}px`;
      wrapper.style.bottom = 'auto'; wrapper.style.right = 'auto';
      // 3D Wobble during drag
      noteCard.style.transform = `rotateX(${-dy/10}deg) rotateY(${dx/10}deg)`;
    }
    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.transition = 'transform 0.3s ease';
      noteCard.style.transform = '';
      saveState();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Components.init());