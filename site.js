/* Общий скрипт всех страниц: подсветка сегодняшнего дня, форма записи, копирование телефона. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Сегодняшний день по московскому времени: 1 = понедельник … 7 = воскресенье
  var today;
  try {
    var map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    today = map[new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Europe/Moscow' }).format(new Date())];
  } catch (e) { today = (new Date().getDay() + 6) % 7 + 1; }
  $$('.day[data-day="' + today + '"]').forEach(function (d) {
    d.classList.add('is-today');
    var b = $('.today-badge', d);
    if (b) b.hidden = false;
  });

  // Видео без автозапуска для тех, кто отключил анимацию
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  }

  // Копирование номера
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.textContent;
      var done = function () { btn.textContent = 'Номер скопирован'; setTimeout(function () { btn.textContent = label; }, 2000); };
      try { navigator.clipboard.writeText(text).then(done, function () {}); } catch (e) {}
    });
  });

  // Форма записи
  var form = $('#signup-form');
  if (!form) return;
  var phone = $('#f-phone', form);
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (!d) { phone.value = ''; return; }
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d.charAt(0) !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    phone.value = '+7' + (p[0] ? ' (' + p[0] : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#f-err', form);
    var name = $('#f-name', form).value.trim();
    var digits = phone.value.replace(/\D/g, '');
    var who = $('input[name="who"]:checked', form);
    var fail = function (msg, el) { err.textContent = msg; err.hidden = false; el.focus(); };
    if (!name) return fail('Напишите, как к вам обращаться.', $('#f-name', form));
    if (digits.length !== 11) return fail('Проверьте номер: нужно 10 цифр после +7.', phone);
    if (!who) return fail('Выберите, кто будет заниматься.', $('input[name="who"]', form));
    err.hidden = true;
    var hall = $('#f-hall', form);
    var exp = $('input[name="exp"]:checked', form);
    // На опубликованном сайте здесь заявка уходит тренеру в Telegram (бот) — подключается при размещении.
    $('#f-summary').textContent = name + ', ' + phone.value + '. Зал: ' + hall.options[hall.selectedIndex].text +
      '. Кто занимается: ' + who.value + (exp ? '. Опыт: ' + exp.value : '') + '.';
    $('#f-body').hidden = true;
    $('#f-done').hidden = false;
  });
  $('#f-again').addEventListener('click', function () { $('#f-body').hidden = false; $('#f-done').hidden = true; });
})();
