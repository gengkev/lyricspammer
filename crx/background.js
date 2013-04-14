// choose a random integer between a and b (inclusive)
function randInt(a,b){return a+Math.floor(Math.random()*(++b-a))}

console.log("hi");
function loadLyricList(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", chrome.extension.getURL("tswift_new.json"), true);
	xhr.onload = function() {
		var json = JSON.parse(xhr.responseText);
		// console.log(json);
		callback(json);
	};
	xhr.send();
}

function getAzLyrics(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function() {
		var text = xhr.responseText;
		var beginMark = "<!-- start of lyrics -->";
		var endMark = "<!-- end of lyrics -->";
		
		var lyrics = text.substring(
			text.indexOf(beginMark) + beginMark.length,
			text.indexOf(endMark)
		).replace(/\n/gm, "").split(/<br\s?\/>/gm);
		
		// console.log(lyrics);
		callback(lyrics);
	};
	xhr.send();
}

function getAuthenticityToken(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://ask.fm/account/questions/quick_mass_new", true);
	xhr.onload = function() {
		var regex = /<input name=\"authenticity_token\" type=\"hidden\" value=\"[A-Za-z0-9=/+]{44}\" \/>/m;
		var offset = 54, length = 44;
		var index = xhr.responseText.search(regex);
		var token = xhr.responseText.substring(index + offset, index + offset + length);
		console.log(token);
		callback(token);
	};
	xhr.send();
}

// assumes user is logged in
function askQuestion(content, usernames, callback) {
	getAuthenticityToken(function(authenticity_token) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "http://ask.fm/account/questions/quick_mass_create", true);
		var fd = new FormData();
		fd.append("authenticity_token", authenticity_token);
		fd.append("question[question_text]", content);
		fd.append("question[friends]", usernames);
		fd.append("captcha", "");
		fd.append("captcha_key", "");
		fd.append("force_anonymous", "");
		xhr.onload = function() {
			console.log(xhr);
			callback();
		};
		xhr.send(fd);
	});
}

function postRandomLyrics(usernames) {
	loadLyricList(function(lyricsList) {
		// choose a random song
		var song = lyricsList[randInt(0, lyricsList.length - 1)];

		console.log("Picked song", song);
		
		getAzLyrics(song[1], function(lyrics) {
			// let's pick some random lyrics
			var length = 4;
			var offset = randInt(0, lyrics.length - length);
			
			lyrics = lyrics.slice(offset, offset + length).join("\n");
			
			console.log("Chose lyrics:\n", "-> " + lyrics.replace(/\n/gm, "\n -> "));
			
			var signature = "\n (MLSS)";
			
			askQuestion(lyrics + signature, usernames, function() {
				console.log("yay?");
			});
		});
	});
}
