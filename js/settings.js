var settings = {
	
}

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
				c = 0xFFFF00;
				break;
			case 'ediblecolor':
				c = 0x00DD00;
				break;
			case 'powerupcolor':
				c = 0xFFFF00;
				break;
			case 'enemycolor':
				c = 0xFF0000;
				break;
			case 'watercolorn':
				c = 0xFFFF00;
				break;
			case 'watercolorh':
				c = 0xFF0000;
				break;
			case 'backcolor':
				c = 0xFFFF00;
				break;
			case 'suncolor':
				c = 0xFFFF00;
				break;
			case 'pagecolor':
				c = 0xFFFF00;
				break;
			case 'panelcolor':
				c = 0xFFFF00;
				break;
			case 'paneltcolor':
				c = 0x000000;
				break;
			case 'healthbarcolor':
				c = 0xFFFF00;
				break;
			case 'powerupbarcolor':
				c = 0xFFFF00;
				break;
			case 'messagecolor':
				c = 0xFFFF00;
				break;
			default:
				c = 0x000000;
				break;
		}
	return "0x" + c.toString(16);
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
