function optionSet(o) {
	SetOption(o.srcElement.id, o.srcElement.checked);
}

document.onload = function() {
document.getElementById('noEyes').onclick = optionSet;
document.getElementById('noOutline').onclick = optionSet;
document.getElementById('black') = optionSet;
}
