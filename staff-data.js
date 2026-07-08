/* ------------------------------------------------------------------
   NSO Regional Office, Shimla — Staff directory data layer
   Stores staff records per office in localStorage (client-side only).
   Shared by office-*.html (hierarchy display) and staff-admin.html (CRUD).

   Every staff member has a "tier" (1 = senior-most in that office, higher
   numbers = further down the chain). office-*.html no longer hardcodes
   an org chart — it is built entirely from this data, so any change made
   in staff-admin.html appears immediately, in hierarchy form, wherever
   that office (or a linked office) is shown.
------------------------------------------------------------------- */
(function (global) {
  var KEY_PREFIX = 'nso_staff_v1_';
  var LEADERSHIP_KEY = 'nso_leadership_v1';

  var OFFICES = ['shimla', 'hamirpur', 'dharamshala', 'mandi'];

  var OFFICE_LABELS = {
    shimla: 'Shimla RO (Headquarters)',
    hamirpur: 'SRO Hamirpur',
    dharamshala: 'SRO Dharamshala',
    mandi: 'SRO Mandi'
  };

  // Tiers describe *rank in this office's chain*, not job family.
  // Tier 1 is always the office's senior-most in-charge.
  var TIER_LABELS = {
    1: 'Office in-charge',
    2: 'Statistical / supervisory officers',
    3: 'Field officers',
    4: 'Field staff / enumerators'
  };
  var TIER_COUNT = 4;

  // National-level post shown above every office. Not tied to a single
  // office's roster, so it is stored separately and edited from the
  // "Leadership" panel on the Staff directory admin page.
  var leadershipDefault = {
    ddgName: '[Add name]',
    ddgRole: 'Deputy Director General (DDG)'
  };

  var seed = {
    shimla: [
      { id: 'sh-1', employeeId: '', name: 'Ajay Kumar Kumawat', email: '', gender: '', designation: 'Deputy Director', tier: 1, photo: '' },
      { id: 'sh-2', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Assistant Director', tier: 2, photo: '' },
      { id: 'sh-3', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Senior Statistical Officer', tier: 2, photo: '' },
      { id: 'sh-4', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Officer, PLFS', tier: 3, photo: '' },
      { id: 'sh-5', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Officer, UFS', tier: 3, photo: '' },
      { id: 'sh-imp-1', employeeId: "SUP.SML.68", name: "Sehdev", email: "sehdevzokta@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-2', employeeId: "ENM.SML.123", name: "Banshidhar Yadav", email: "banshi4320@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-3', employeeId: "ENM.SML.133", name: "Amit Dixit", email: "amitdixit00@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-4', employeeId: "ENM.SML.134", name: "Nikhil Chauhan", email: "chauhannikhil12@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-5', employeeId: "SUP.SML.46", name: "Sandeep Daniel", email: "jul2007@rediffmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-6', employeeId: "SUP.SML.1", name: "Bhagvan Dass Negi", email: "bdnegi1971@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-7', employeeId: "ENM.SML.8", name: "Reetu Raj", email: "reetu77089@gmail.com", gender: "Female", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-8', employeeId: "SUP.SML.21", name: "Haider Ali", email: "haider.ali.nsso@gov.in", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-9', employeeId: "ENM.SML.27", name: "Lalit Chauhan", email: "lalitchauhan422@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-10', employeeId: "ENM.SML.82", name: "Ramesh Chand", email: "ramesharki91@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-11', employeeId: "ENM.SML.105", name: "Naveen Yadav", email: "naveenkalakh28@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-12', employeeId: "ENM.SML.81", name: "Bal Krishan Sharma", email: "bntsharma2@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-13', employeeId: "ENM.SML.28", name: "Abhay Chandel", email: "siloverboy08@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-14', employeeId: "SUP.SML.47", name: "Sanjay Kumar", email: "sanjaysmridhi1970@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-15', employeeId: "SUP.SML.20", name: "Chhering Vidya", email: "cvnegi76@rediffmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-16', employeeId: "ENM.SML.117", name: "Chhering Vidya", email: "wangchoo76@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-17', employeeId: "SUP.SML.43", name: "Pintu Sharma", email: "psharma3389@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-18', employeeId: "ENM.SML.108", name: "Chandan Panwar", email: "chandanpanwar001@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-19', employeeId: "ENM.SML.80", name: "Naresh Jaswal", email: "nareshjaswal001@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-20', employeeId: "ENM.SML.32", name: "Munish Kumar", email: "munishthakur035@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-21', employeeId: "ENM.SML.26", name: "Dhiraj Sharma", email: "dhirajsharmasml@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-22', employeeId: "ENM.SML.9", name: "Radhika", email: "radhika.negi010193@gmail.com", gender: "Female", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-23', employeeId: "ENM.SML.88", name: "Ankit Sharma", email: "ankit.7bhardwaj@outlook.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-24', employeeId: "SUP.SML.111", name: "Santosh Kumar", email: "santosh679717@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-25', employeeId: "ENM.SML.64", name: "Amit Dixit", email: "amitdixit00@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-26', employeeId: "ENM.SML.115", name: "Sanjay Masta", email: "mastasanjay84@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-27', employeeId: "ENM.SML.5", name: "Guddu Ram", email: "guddu26291@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-28', employeeId: "ENM.SML.106", name: "Hark Bahadur", email: "ht701859@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-29', employeeId: "ENM.SML.104", name: "Munish Kumar", email: "whomunish@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-30', employeeId: "ENM.SML.25", name: "Joginder", email: "joginderchandel833@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-31', employeeId: "ENM.SML.7", name: "Adarsh Kumar", email: "adarsh.kumar1591@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-32', employeeId: "SUP.SML.22", name: "Sanjay Masta", email: "mastasanjay84@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-33', employeeId: "SUP.SML.44", name: "Vir Singh", email: "vir.singh82@gov.in", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-34', employeeId: "SUP.SML.122", name: "Sushant Kumar Singh", email: "thakurvijaykaransingh@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-35', employeeId: "ENM.SML.24", name: "Puneet Chandel", email: "puneetchandeldashil@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-36', employeeId: "SUP.SML.19", name: "Mehar Chand Negi", email: "mcnegi74@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-37', employeeId: "SUP.SML.69", name: "Ramesh Negi", email: "rameshnegi2014@gmail.com", gender: "Male", designation: "Supervisor (SSO)", tier: 2, photo: '' },
      { id: 'sh-imp-38', employeeId: "ENM.SML.84", name: "Vijay Kanwar", email: "kanwarvijay312@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' },
      { id: 'sh-imp-39', employeeId: "ENM.SML.89", name: "Basant Kumar", email: "basantgodara3@gmail.com", gender: "Male", designation: "Enumerator (JSO)", tier: 4, photo: '' }
    ],
    hamirpur: [
      { id: 'ha-1', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'SRO In-charge', tier: 1, photo: '' },
      { id: 'ha-2', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Officer', tier: 2, photo: '' },
      { id: 'ha-3', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Investigator', tier: 3, photo: '' }
    ],
    dharamshala: [
      { id: 'dh-1', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'SRO In-charge', tier: 1, photo: '' },
      { id: 'dh-2', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Officer', tier: 2, photo: '' },
      { id: 'dh-3', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Investigator', tier: 3, photo: '' }
    ],
    mandi: [
      { id: 'ma-1', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'SRO In-charge', tier: 1, photo: '' },
      { id: 'ma-2', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Officer', tier: 2, photo: '' },
      { id: 'ma-3', employeeId: '', name: '[Add name]', email: '', gender: '', designation: 'Field Investigator', tier: 3, photo: '' }
    ]
  };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function uid() {
    return 'st-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function normalizeTier(t) {
    var n = parseInt(t, 10);
    if (isNaN(n) || n < 1) return TIER_COUNT;
    if (n > TIER_COUNT) return TIER_COUNT;
    return n;
  }

  function getStaff(officeId) {
    var list;
    try {
      var raw = localStorage.getItem(KEY_PREFIX + officeId);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch (e) { /* ignore corrupt storage */ }
    if (!list) list = seed[officeId] ? clone(seed[officeId]) : [];
    // Backward compatibility: records saved before "tier" existed.
    list.forEach(function (s) { s.tier = normalizeTier(s.tier); });
    return list;
  }

  function saveStaff(officeId, list) {
    localStorage.setItem(KEY_PREFIX + officeId, JSON.stringify(list));
  }

  function resetStaff(officeId) {
    localStorage.removeItem(KEY_PREFIX + officeId);
  }

  function getLeadership() {
    try {
      var raw = localStorage.getItem(LEADERSHIP_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return {
          ddgName: parsed.ddgName || leadershipDefault.ddgName,
          ddgRole: parsed.ddgRole || leadershipDefault.ddgRole
        };
      }
    } catch (e) { /* ignore corrupt storage */ }
    return clone(leadershipDefault);
  }

  function saveLeadership(data) {
    localStorage.setItem(LEADERSHIP_KEY, JSON.stringify({
      ddgName: (data.ddgName || '').trim() || leadershipDefault.ddgName,
      ddgRole: (data.ddgRole || '').trim() || leadershipDefault.ddgRole
    }));
  }

  // The office in-charge (tier 1) of Shimla RO doubles as the Deputy
  // Director referenced above every sub-office's own chain — so editing
  // Shimla's tier-1 staff member updates that reference everywhere.
  function getShimlaDD() {
    var list = getStaff('shimla');
    var top = list.filter(function (s) { return s.tier === 1; })[0];
    return top || { name: '[Add name]', designation: 'Deputy Director' };
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

  function nodePhotoHtml(s, cls, fbCls) {
    return s.photo
      ? '<img class="' + cls + '" src="' + s.photo + '" alt="' + escapeHtml(s.name) + '">'
      : '<div class="' + cls + ' ' + fbCls + '">' + initials(s.name) + '</div>';
  }

  function orgNodeHtml(name, role, opts) {
    opts = opts || {};
    var cls = 'org-node' + (opts.top ? ' top' : '');
    var photo = opts.photo !== undefined
      ? nodePhotoHtml({ name: name, photo: opts.photo }, 'org-node-photo', 'org-node-photo-fallback')
      : '';
    var titleAttr = opts.email ? ' title="' + escapeHtml(opts.email) + '"' : '';
    return (
      '<div class="' + cls + '"' + titleAttr + '>' +
        photo +
        '<div class="n-name">' + escapeHtml(name) + '</div>' +
        '<div class="n-role">' + escapeHtml(role) + '</div>' +
      '</div>'
    );
  }

  // A single roster chip used inside a grouped-tier card (see rosterGroupHtml).
  function rosterChipHtml(s) {
    var titleAttr = s.email ? ' title="' + escapeHtml(s.email) + '"' : '';
    return (
      '<div class="roster-chip"' + titleAttr + '>' +
        nodePhotoHtml(s, 'roster-chip-photo', 'roster-chip-photo-fallback') +
        '<div class="roster-chip-body">' +
          '<div class="roster-chip-name">' + escapeHtml(s.name) + '</div>' +
          '<div class="roster-chip-role">' + escapeHtml(s.designation) + (s.employeeId ? ' &middot; ' + escapeHtml(s.employeeId) : '') + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // When a hierarchy tier has many members (a large field roster, for
  // example), drawing one branch per person becomes an unreadable wall
  // of boxes. Past a threshold, that tier collapses into a single
  // labelled card containing a compact wrapped grid — still clearly a
  // level of the hierarchy, just legible at 30+ people.
  var ROSTER_GROUP_THRESHOLD = 7;

  function rosterGroupHtml(tierNum, members) {
    return (
      '<div class="roster-group">' +
        '<div class="roster-group-head">' + escapeHtml(TIER_LABELS[tierNum] || ('Tier ' + tierNum)) +
          ' <span class="roster-group-count">' + members.length + '</span></div>' +
        '<div class="roster-grid">' +
          members.map(rosterChipHtml).join('') +
        '</div>' +
      '</div>'
    );
  }

  // Builds the full hierarchy (DDG -> Shimla DD -> this office's own
  // tiers) purely from stored data. No two offices ever show stale or
  // hand-typed placeholder names once the admin page has been used.
  function renderOrgChart(containerId, officeId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var leadership = getLeadership();
    var staff = getStaff(officeId);
    var byTier = {};
    staff.forEach(function (s) {
      (byTier[s.tier] = byTier[s.tier] || []).push(s);
    });

    var html = '<div class="org-tier">' +
      orgNodeHtml(leadership.ddgName, leadership.ddgRole, { top: true }) +
    '</div>';

    if (officeId !== 'shimla') {
      var dd = getShimlaDD();
      html += '<div class="org-connector"></div>';
      html += '<div class="org-tier">' +
        orgNodeHtml(dd.name, dd.designation + ', Shimla RO', { photo: dd.photo, email: dd.email }) +
      '</div>';
    }

    var tierNums = Object.keys(byTier).map(Number).sort(function (a, b) { return a - b; });

    if (!tierNums.length) {
      html += '<div class="org-connector"></div>' +
        '<div class="org-tier"><p class="lead" style="margin:0;">No staff added yet for this office. ' +
        'Use the <a href="staff-admin.html" style="color:var(--slate);text-decoration:underline;">Staff directory admin</a> page to build out the hierarchy.</p></div>';
      el.innerHTML = html;
      return;
    }

    tierNums.forEach(function (tierNum, i) {
      var members = byTier[tierNum];
      html += '<div class="org-connector"></div>';
      if (members.length > ROSTER_GROUP_THRESHOLD) {
        html += rosterGroupHtml(tierNum, members);
      } else if (members.length <= 1) {
        html += '<div class="org-tier">' +
          members.map(function (s) { return orgNodeHtml(s.name, s.designation, { photo: s.photo, email: s.email }); }).join('') +
        '</div>';
      } else {
        // Multiple peers at this level: fan them out as branches so the
        // chart still reads as a hierarchy rather than a plain row.
        html += '<div class="org-branches">' +
          members.map(function (s) {
            return '<div class="org-branch">' + orgNodeHtml(s.name, s.designation, { photo: s.photo, email: s.email }) + '</div>';
          }).join('') +
        '</div>';
      }
    });

    el.innerHTML = html;
  }

  global.NSOStaff = {
    OFFICES: OFFICES,
    OFFICE_LABELS: OFFICE_LABELS,
    TIER_LABELS: TIER_LABELS,
    TIER_COUNT: TIER_COUNT,
    getStaff: getStaff,
    saveStaff: saveStaff,
    resetStaff: resetStaff,
    getLeadership: getLeadership,
    saveLeadership: saveLeadership,
    normalizeTier: normalizeTier,
    initials: initials,
    escapeHtml: escapeHtml,
    uid: uid,
    renderOrgChart: renderOrgChart
  };
})(window);
