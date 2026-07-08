/* ------------------------------------------------------------------
   NSO Regional Office, Shimla — Staff directory data layer
   Stores staff records per office in localStorage (client-side only).
   Shared by office-*.html (display) and staff-admin.html (CRUD).
------------------------------------------------------------------- */
(function (global) {
  var KEY_PREFIX = 'nso_staff_v1_';

  var OFFICES = ['shimla', 'hamirpur', 'dharamshala', 'mandi'];

  var OFFICE_LABELS = {
    shimla: 'Shimla RO (Headquarters)',
    hamirpur: 'SRO Hamirpur',
    dharamshala: 'SRO Dharamshala',
    mandi: 'SRO Mandi'
  };

  var seed = {
    shimla: [
      { id: 'sh-1', name: 'Ajay Kumar Kumawat', designation: 'Deputy Director', photo: '' },
      { id: 'sh-2', name: '[Add name]', designation: 'Assistant Director', photo: '' },
      { id: 'sh-3', name: '[Add name]', designation: 'Senior Statistical Officer', photo: '' },
      { id: 'sh-4', name: '[Add name]', designation: 'Field Officer, PLFS', photo: '' },
      { id: 'sh-5', name: '[Add name]', designation: 'Field Officer, UFS', photo: '' }
    ],
    hamirpur: [
      { id: 'ha-1', name: '[Add name]', designation: 'SRO In-charge', photo: '' },
      { id: 'ha-2', name: '[Add name]', designation: 'Field Officer', photo: '' },
      { id: 'ha-3', name: '[Add name]', designation: 'Field Investigator', photo: '' }
    ],
    dharamshala: [
      { id: 'dh-1', name: '[Add name]', designation: 'SRO In-charge', photo: '' },
      { id: 'dh-2', name: '[Add name]', designation: 'Field Officer', photo: '' },
      { id: 'dh-3', name: '[Add name]', designation: 'Field Investigator', photo: '' }
    ],
    mandi: [
      { id: 'ma-1', name: '[Add name]', designation: 'SRO In-charge', photo: '' },
      { id: 'ma-2', name: '[Add name]', designation: 'Field Officer', photo: '' },
      { id: 'ma-3', name: '[Add name]', designation: 'Field Investigator', photo: '' }
    ]
  };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function uid() {
    return 'st-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function getStaff(officeId) {
    try {
      var raw = localStorage.getItem(KEY_PREFIX + officeId);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore corrupt storage */ }
    return seed[officeId] ? clone(seed[officeId]) : [];
  }

  function saveStaff(officeId, list) {
    localStorage.setItem(KEY_PREFIX + officeId, JSON.stringify(list));
  }

  function resetStaff(officeId) {
    localStorage.removeItem(KEY_PREFIX + officeId);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function initials(name) {
    if (!name || /^\[Add name\]/.test(name)) return '--';
    var parts = name.trim().split(/\s+/);
    var first = parts[0] ? parts[0][0] : '';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  function staffCardHtml(s) {
    var photoBlock = s.photo
      ? '<img class="staff-photo" src="' + s.photo + '" alt="' + escapeHtml(s.name) + '">'
      : '<div class="staff-photo staff-photo-fallback">' + initials(s.name) + '</div>';
    return (
      '<div class="staff-card">' +
        photoBlock +
        '<div class="staff-card-name">' + escapeHtml(s.name) + '</div>' +
        '<div class="staff-card-role">' + escapeHtml(s.designation) + '</div>' +
      '</div>'
    );
  }

  function renderStaffGrid(containerId, officeId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var list = getStaff(officeId);
    if (!list.length) {
      el.innerHTML = '<p class="lead">No staff added yet. Use the Staff directory admin page to add members.</p>';
      return;
    }
    el.innerHTML = list.map(staffCardHtml).join('');
  }

  global.NSOStaff = {
    OFFICES: OFFICES,
    OFFICE_LABELS: OFFICE_LABELS,
    getStaff: getStaff,
    saveStaff: saveStaff,
    resetStaff: resetStaff,
    initials: initials,
    escapeHtml: escapeHtml,
    uid: uid,
    renderStaffGrid: renderStaffGrid
  };
})(window);
