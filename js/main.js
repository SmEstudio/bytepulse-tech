/**
 * ==============================================================================
 * BytePulse - Scripts Principales & Herramientas de Ciberseguridad / Redes
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCookieBanner();
  initPasswordTool();
  initDownloadSpeedTool();
  initDataUnitConverter();
  initJSONTools();
  initBase64Tool();
  initReadingProgressBar();
  initFAQAccordion();
  initNewsletterForm();
});

/* ==============================================================================
   1. Navegación Móvil
   ============================================================================== */
function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }
}

/* ==============================================================================
   2. Banner de Consentimiento de Cookies (RGPD)
   ============================================================================== */
function initCookieBanner() {
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  if (!cookieBanner) return;

  if (!localStorage.getItem('bytepulse_cookie_consent')) {
    cookieBanner.style.display = 'block';
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('bytepulse_cookie_consent', 'accepted');
      cookieBanner.style.display = 'none';
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('bytepulse_cookie_consent', 'declined');
      cookieBanner.style.display = 'none';
    });
  }
}

/* ==============================================================================
   3. Generador y Analizador de Contraseñas Seguras (Entropy Shannon)
   ============================================================================== */
function initPasswordTool() {
  const form = document.getElementById('pwd-gen-form');
  const lengthInput = document.getElementById('pwd-length');
  const lengthVal = document.getElementById('pwd-length-val');
  const upperCb = document.getElementById('pwd-upper');
  const lowerCb = document.getElementById('pwd-lower');
  const numbersCb = document.getElementById('pwd-numbers');
  const symbolsCb = document.getElementById('pwd-symbols');
  const excludeAmbiguousCb = document.getElementById('pwd-no-ambiguous');

  const outputEl = document.getElementById('pwd-output');
  const copyBtn = document.getElementById('pwd-copy-btn');
  const entropyEl = document.getElementById('pwd-entropy');
  const crackTimeEl = document.getElementById('pwd-crack-time');
  const strengthBar = document.getElementById('pwd-strength-bar');

  if (!outputEl) return;

  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const AMBIGUOUS = /[il1Lo0OI]/g;

  function generatePassword() {
    let pool = '';
    if (upperCb && upperCb.checked) pool += UPPER;
    if (lowerCb && lowerCb.checked) pool += LOWER;
    if (numbersCb && numbersCb.checked) pool += NUMBERS;
    if (symbolsCb && symbolsCb.checked) pool += SYMBOLS;

    if (excludeAmbiguousCb && excludeAmbiguousCb.checked) {
      pool = pool.replace(AMBIGUOUS, '');
    }

    if (!pool) {
      pool = LOWER + NUMBERS; // Fallback
    }

    const len = lengthInput ? parseInt(lengthInput.value, 10) : 16;
    if (lengthVal) lengthVal.textContent = len;

    // Criptográficamente seguro con window.crypto
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < len; i++) {
      password += pool[array[i] % pool.length];
    }

    outputEl.value = password;
    evaluateSecurity(password, pool.length);
  }

  function evaluateSecurity(password, poolSize) {
    if (!password) return;
    // Entropía de Shannon: E = L * log2(R)
    const entropy = Math.round(password.length * Math.log2(poolSize || 64));
    if (entropyEl) entropyEl.textContent = `${entropy} bits`;

    // Estimación de tiempo para romper a 100 billones de intentos/segundo (cluster GPU moderno)
    // Combinaciones totales = poolSize ^ length = 2 ^ entropy
    const combinations = Math.pow(2, entropy);
    const hashesPerSec = 1e11; // 100 mil millones / seg (ataque offline hashcat)
    const seconds = combinations / (2 * hashesPerSec);

    let timeText = 'Menos de 1 segundo';
    let color = '#ef4444';
    let barWidth = '20%';

    if (entropy < 40) {
      timeText = 'Instantáneo (Muy Débil)';
      color = '#ef4444';
      barWidth = '25%';
    } else if (entropy < 60) {
      timeText = 'Pocos minutos a horas';
      color = '#f59e0b';
      barWidth = '50%';
    } else if (entropy < 80) {
      timeText = 'Varios siglos';
      color = '#10b981';
      barWidth = '75%';
    } else {
      timeText = 'Miles de millones de años (Indescifrable)';
      color = '#059669';
      barWidth = '100%';
    }

    if (crackTimeEl) {
      crackTimeEl.textContent = timeText;
      crackTimeEl.style.color = color;
    }

    if (strengthBar) {
      strengthBar.style.width = barWidth;
      strengthBar.style.backgroundColor = color;
    }
  }

  if (lengthInput) {
    lengthInput.addEventListener('input', () => {
      if (lengthVal) lengthVal.textContent = lengthInput.value;
      generatePassword();
    });
  }

  const inputs = [upperCb, lowerCb, numbersCb, symbolsCb, excludeAmbiguousCb];
  inputs.forEach(el => {
    if (el) el.addEventListener('change', generatePassword);
  });

  const regenBtn = document.getElementById('pwd-regen-btn');
  if (regenBtn) regenBtn.addEventListener('click', generatePassword);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      outputEl.select();
      navigator.clipboard.writeText(outputEl.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '¡Copiado!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 1800);
      });
    });
  }

  generatePassword();
}

/* ==============================================================================
   4. Calculadora de Tiempo de Descarga y Ancho de Banda
   ============================================================================== */
function initDownloadSpeedTool() {
  const form = document.getElementById('speed-calc-form');
  if (!form) return;

  const sizeInput = document.getElementById('file-size');
  const sizeUnit = document.getElementById('file-size-unit'); // MB, GB, TB
  const speedInput = document.getElementById('speed-mbps');
  const resultTimeEl = document.getElementById('res-download-time');
  const resultTransferRateEl = document.getElementById('res-transfer-rate');

  function calculate() {
    const size = parseFloat(sizeInput.value) || 0;
    const unit = sizeUnit.value;
    const mbps = parseFloat(speedInput.value) || 100;

    let totalMB = size;
    if (unit === 'GB') totalMB = size * 1024;
    if (unit === 'TB') totalMB = size * 1024 * 1024;

    // Megabits a Megabytes reales considerando overhead TCP/IP aproximado del 10%
    const effectiveMBps = (mbps * 0.90) / 8;
    const totalSeconds = totalMB / (effectiveMBps || 1);

    if (resultTransferRateEl) {
      resultTransferRateEl.textContent = `${effectiveMBps.toFixed(2)} MB/s reales`;
    }

    if (resultTimeEl) {
      if (totalSeconds < 60) {
        resultTimeEl.textContent = `${Math.ceil(totalSeconds)} segundos`;
      } else if (totalSeconds < 3600) {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = Math.round(totalSeconds % 60);
        resultTimeEl.textContent = `${minutes} min ${secs} seg`;
      } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.round((totalSeconds % 3600) / 60);
        resultTimeEl.textContent = `${hours} horas ${minutes} minutos`;
      }
    }
  }

  form.addEventListener('input', calculate);
  calculate();
}

/* ==============================================================================
   5. Conversor de Unidades de Almacenamiento Digital
   ============================================================================== */
function initDataUnitConverter() {
  const form = document.getElementById('data-unit-form');
  if (!form) return;

  const inputVal = document.getElementById('unit-input-val');
  const inputUnit = document.getElementById('unit-input-type'); // B, KB, MB, GB, TB

  const resBytes = document.getElementById('unit-res-b');
  const resKB = document.getElementById('unit-res-kb');
  const resMB = document.getElementById('unit-res-mb');
  const resGB = document.getElementById('unit-res-gb');
  const resTB = document.getElementById('unit-res-tb');

  function convert() {
    const val = parseFloat(inputVal.value) || 0;
    const unit = inputUnit.value;

    let bytes = val;
    if (unit === 'KB') bytes = val * 1024;
    if (unit === 'MB') bytes = val * Math.pow(1024, 2);
    if (unit === 'GB') bytes = val * Math.pow(1024, 3);
    if (unit === 'TB') bytes = val * Math.pow(1024, 4);

    if (resBytes) resBytes.textContent = bytes.toLocaleString('es-ES') + ' B';
    if (resKB) resKB.textContent = (bytes / 1024).toLocaleString('es-ES', { maximumFractionDigits: 3 }) + ' KB';
    if (resMB) resMB.textContent = (bytes / Math.pow(1024, 2)).toLocaleString('es-ES', { maximumFractionDigits: 3 }) + ' MB';
    if (resGB) resGB.textContent = (bytes / Math.pow(1024, 3)).toLocaleString('es-ES', { maximumFractionDigits: 4 }) + ' GB';
    if (resTB) resTB.textContent = (bytes / Math.pow(1024, 4)).toLocaleString('es-ES', { maximumFractionDigits: 5 }) + ' TB';
  }

  form.addEventListener('input', convert);
  convert();
}

/* ==============================================================================
   6. Formateador / Validador JSON
   ============================================================================== */
function initJSONTools() {
  const jsonInput = document.getElementById('json-input');
  const btnFormat = document.getElementById('btn-json-format');
  const btnMinify = document.getElementById('btn-json-minify');
  const btnCopy = document.getElementById('btn-json-copy');
  const btnClear = document.getElementById('btn-json-clear');
  const statusMsg = document.getElementById('json-status');

  if (!jsonInput || !btnFormat) return;

  btnFormat.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonInput.value.trim());
      jsonInput.value = JSON.stringify(parsed, null, 2);
      if (statusMsg) {
        statusMsg.textContent = "✓ JSON válido y formateado con éxito";
        statusMsg.style.color = "#10b981";
      }
    } catch (e) {
      if (statusMsg) {
        statusMsg.textContent = "✕ Error de sintaxis: " + e.message;
        statusMsg.style.color = "#ef4444";
      }
    }
  });

  if (btnMinify) {
    btnMinify.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(jsonInput.value.trim());
        jsonInput.value = JSON.stringify(parsed);
        if (statusMsg) {
          statusMsg.textContent = "✓ JSON minificado con éxito";
          statusMsg.style.color = "#10b981";
        }
      } catch (e) {
        if (statusMsg) {
          statusMsg.textContent = "✕ Error: " + e.message;
          statusMsg.style.color = "#ef4444";
        }
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!jsonInput.value) return;
      navigator.clipboard.writeText(jsonInput.value).then(() => {
        if (statusMsg) {
          statusMsg.textContent = "✓ Copiado al portapapeles";
          statusMsg.style.color = "#3b82f6";
        }
      });
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      jsonInput.value = "";
      if (statusMsg) statusMsg.textContent = "";
    });
  }
}

/* ==============================================================================
   7. Codificador / Decodificador Base64 & Hash SHA-256
   ============================================================================== */
function initBase64Tool() {
  const inputEl = document.getElementById('b64-input');
  const outputEl = document.getElementById('b64-output');
  const btnEncode = document.getElementById('btn-b64-encode');
  const btnDecode = document.getElementById('btn-b64-decode');
  const btnHash = document.getElementById('btn-b64-hash');

  if (!inputEl || !btnEncode) return;

  btnEncode.addEventListener('click', () => {
    try {
      outputEl.value = btoa(unescape(encodeURIComponent(inputEl.value)));
    } catch (e) {
      outputEl.value = "Error al codificar: " + e.message;
    }
  });

  if (btnDecode) {
    btnDecode.addEventListener('click', () => {
      try {
        outputEl.value = decodeURIComponent(escape(atob(inputEl.value.trim())));
      } catch (e) {
        outputEl.value = "Error al decodificar: formato Base64 inválido.";
      }
    });
  }

  if (btnHash) {
    btnHash.addEventListener('click', async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputEl.value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        outputEl.value = "SHA-256:\n" + hashHex;
      } catch (e) {
        outputEl.value = "Error generando hash: " + e.message;
      }
    });
  }
}

/* ==============================================================================
   8. Barra de Lectura, FAQ y Newsletter
   ============================================================================== */
function initReadingProgressBar() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    if (btn && input) {
      btn.textContent = "✓ ¡Suscrito al Boletín!";
      btn.style.background = "#10b981";
      input.value = "";
      setTimeout(() => {
        btn.textContent = "Suscribirme Gratis";
        btn.style.background = "#6366f1";
      }, 4000);
    }
  });
}

