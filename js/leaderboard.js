var leaderboard = (function() {
	// Only the Go server (main.go) serves /api; static hosts like GitHub or GitLab Pages use it cross-origin.
	var sameOrigin = /^https?:$/.test(location.protocol) &&
		['fish-eater.duckfam.us', 'localhost', '127.0.0.1'].indexOf(location.hostname) !== -1;
	var url = (sameOrigin ? '' : 'https://fish-eater.duckfam.us') + '/api/scores';

	function request(options) {
		return fetch(url, options).then(function(res) {
			if (!res.ok)
				return res.text().then(function(t) { throw new Error(t || res.statusText); });
			return res.json();
		});
	}

	function load() {
		return request();
	}

	function submit(name, score) {
		var body = new URLSearchParams();
		body.append('name', name);
		body.append('score', score);
		return request({ method: 'POST', body: body });
	}

	function storageGet(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			return null;
		}
	}

	function storageSet(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {}
	}

	function personal() {
		try {
			var entries = JSON.parse(storageGet('personalScores'));
			return Array.isArray(entries) ? entries : [];
		} catch (e) {
			return [];
		}
	}

	function record(score) {
		var entry = { score: score, time: new Date().toISOString() };
		var entries = personal();
		entries.push(entry);
		entries.sort(function(a, b) { return b.score - a.score; });
		entries = entries.slice(0, 10);
		storageSet('personalScores', JSON.stringify(entries));
		return entry;
	}

	function renderPersonal(list, mine) {
		var entries = personal().map(function(e) {
			return { name: new Date(e.time).toLocaleDateString(), score: e.score, time: e.time };
		});
		render(list, entries, mine && function(e) { return e.time === mine.time; }, 'Play a game to set a score!');
	}

	function render(list, entries, isMine, emptyText) {
		list.innerHTML = '';
		if (!entries.length) {
			var empty = document.createElement('li');
			empty.textContent = emptyText || 'No scores yet. Be the first!';
			list.appendChild(empty);
			return;
		}
		entries.forEach(function(e) {
			var li = document.createElement('li');
			var name = document.createElement('span');
			var score = document.createElement('span');
			name.className = 'name';
			score.className = 'score';
			name.textContent = e.name;
			score.textContent = e.score;
			li.appendChild(name);
			li.appendChild(score);
			if (isMine && isMine(e))
				li.className = 'mine';
			list.appendChild(li);
		});
	}

	function renderError(list, err) {
		list.innerHTML = '';
		var li = document.createElement('li');
		li.textContent = 'Leaderboard unavailable: ' + err.message;
		list.appendChild(li);
	}

	var panel = null;

	function build() {
		panel = document.createElement('div');
		panel.id = 'leaderboard';
		panel.innerHTML =
			'<h2></h2>' +
			'<form><input name="name" maxlength="20" placeholder="Your name" autocomplete="nickname" required>' +
			'<button type="submit">Submit</button></form>' +
			'<p class="status"></p>' +
			'<div class="lists">' +
			'<section><h3>Your best</h3><ol class="personal"></ol></section>' +
			'<section><h3>Top 20</h3><ol class="global"></ol></section>' +
			'</div>' +
			'<button type="button" class="again"><i class="fa fa-repeat"></i> Play again</button>';

		// The game's key controller listens on document; keep typing out of it.
		panel.addEventListener('keydown', function(e) { e.stopPropagation(); });
		panel.addEventListener('keyup', function(e) { e.stopPropagation(); });

		panel.querySelector('.again').addEventListener('click', function() {
			game.setPaused(false);
		});
		document.body.appendChild(panel);
	}

	function show(player) {
		if (!panel)
			build();
		if (panel.style.display === 'block')
			return;

		var score = Math.floor(player.getScore().total);
		var form = panel.querySelector('form');
		var input = form.querySelector('input');
		var button = form.querySelector('button');
		var status = panel.querySelector('.status');
		var list = panel.querySelector('ol.global');

		renderPersonal(panel.querySelector('ol.personal'), record(score));

		panel.querySelector('h2').textContent = game.pausedMessage + ' Score: ' + score;
		status.textContent = '';
		input.value = storageGet('username') || '';
		input.disabled = button.disabled = false;
		form.style.display = '';
		form.onsubmit = function(e) {
			e.preventDefault();
			var name = input.value.trim();
			if (!name)
				return;
			storageSet('username', name);
			input.disabled = button.disabled = true;
			status.textContent = 'Submitting…';
			submit(name, score).then(function(entries) {
				form.style.display = 'none';
				var isMine = function(e) { return e.name.toLowerCase() === name.toLowerCase(); };
				var mine = entries.filter(isMine)[0];
				if (!mine)
					status.textContent = 'Not quite top 20. Try again!';
				else if (mine.score > score)
					status.textContent = 'Your best of ' + mine.score + ' is still on the board.';
				else
					status.textContent = 'You made the leaderboard!';
				render(list, entries, isMine);
			}, function(err) {
				input.disabled = button.disabled = false;
				status.textContent = 'Submit failed: ' + err.message;
			});
		};

		load().then(function(entries) { render(list, entries); }, function(err) { renderError(list, err); });
		panel.style.display = 'block';
	}

	function hide() {
		if (panel)
			panel.style.display = 'none';
	}

	return { load: load, render: render, renderPersonal: renderPersonal, renderError: renderError, show: show, hide: hide };
})();
