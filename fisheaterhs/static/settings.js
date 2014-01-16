function GetVersion() {
	var v = localStorage.getItem('version');
	if (v == '1')
		return 1;
	else if (v == '2')
		return 2;
	else
		return 3;
}

function SetVersion(index) {
	localStorage.setItem('version', index + 1);
}

function GetColor(cname) {
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

function SetColor(cname, color) {
	localStorage.setItem("color." + cname, color);
}

function GetPath(pname) {
	var p = localStorage.getItem("path." + pname);
	if (p == undefined || p == null)
		return "";
	else return p;
}

function SetPath(pname, path) {
	localStorage.setItem("path." + cname, path);
}

function GetOption(id) {
	var o = localStorage.getItem("option." + id);
	if (o == undefined || o == null)
		return false;
	else return o == 'true';
}

function SetOption(id, enabled) {
	localStorage.setItem("option." + id, String(enabled));
}

function GetKey(id) {
}

function SetKey(id, key) {
}
