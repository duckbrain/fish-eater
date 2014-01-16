function GetVersion()
{
	var v = localStorage.getItem('version');
	if (v == '1')
		return 1;
	else if (v == '2')
		return 2;
	else
		return 3;
}

function SetVersion(index)
{
	localStorage.setItem('version', index + 1);
}

function GetColor(cname)
{
	var c = localStorage.getItem("color." + cname);
	if (c == undefined || c == null)
		switch (cname) {
			case 'yourcolor':
				c = 'FFFF00';
				break;
			case 'ediblecolor':
				c = '00DD00';
				break;
			case 'powerupcolor':
				c = 'FFFF00';
				break;
			case 'enemycolor':
				c = 'red';
				break;
			case 'watercolorn':
				c = 'FFFF00';
				break;
			case 'watercolorh':
				c = 'FF0000';
				break;
			case 'backcolor':
				c = 'FFFF00';
				break;
			case 'suncolor':
				c = 'FFFF00';
				break;
			case 'pagecolor':
				c = 'FFFF00';
				break;
			case 'panelcolor':
				c = 'FFFF00';
				break;
			case 'paneltcolor':
				c = '000000';
				break;
			case 'healthbarcolor':
				c = 'FFFF00';
				break;
			case 'powerupbarcolor':
				c = 'FFFF00';
				break;
			case 'messagecolor':
				c = 'FFFF00';
				break;
			default:
				c = '000000';
				break;
		}
	return c;
}

function SetColor(cname, color)
{
	localStorage.setItem("color." + cname, color);
}

function GetPath(pname)
{
	var p = localStorage.getItem("path." + pname);
	if (p == undefined || p == null)
		return "";
	else return p;
}

function SetPath(pname, path)
{
	localStorage.setItem("path." + cname, path);
}

function GetOption(id)
{
	var o = localStorage.getItem("option." + id);
	if (o == undefined || o == null)
		return false;
	else return o == 'true';
}

function SetOption(id, enabled)
{
	localStorage.setItem("option." + id, String(enabled));
}

scoreServer = 'http://localhost:8080/';

function SubmitHighScore()
{
  var username = localStorage.getItem('username');
  if (!username)
  {
    username = prompt('What name would you like displayed on the high score list?' +
      ' (This will be public)');
    localStorage.setItem('username', username);
    if (!username)
      return;
  }
  
  var formData = new FormData();
  formData.append("score", localStorage.getItem('highscore'));
  formData.append("name", username);
  
  var xhr = new XMLHttpRequest();
  xhr.open("POST", scoreServer);
  xhr.send(formData);
}

function GetHighScores()
{
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(aEvt)
  {
    if (req.readyState == 4)
    {
      //req.responseText has json
      var highscorelist = JSON.parse(req.responseText);
      //TODO Do more things with it
      console.debug(highscorelist);
    }
    else
    {
      //An error occurred
      console.debug(req);
    }
  }
  req.open('GET', scoreServer, true);
}
