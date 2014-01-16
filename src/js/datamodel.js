if (typeof(window.lds) != 'object') window.lds = {};
// This class will take a JSON object and create a data model for Knockout JS.
// Each page should load the JSON object and create an instance of this class.
window.lds.DataModel = function(model) {
	var self = this;
	
	self.model = model;
	self.koModel = null;
	self.chromeStorage = false;//chrome ? true : false;
	self.autosave = true;
	
	// Creates the knockoutjs model from the data model provided
	// Must be called after object creation before it is used as knockout model.
	self.createKOObject = function() {
		var kom = {};
		for (var field in self.model) {
			var item = self.model[field];
			var value = item.value || item.default; // Get right value
			
			// TODO: Smart observable making based on type
			kom[field] = ko.observable(value);
			
			// Copy meta info to observable
			for (var meta in item)
				kom[field][meta] = item[meta];
			if (!"sync" in kom[field])
				kom[field].sync = true;
		}
		self.koModel = kom;
	};
	
	// Creates a knockoutjs compatible model with raw data. No observables
	// Must be called after object creation instead of createKOObject.
	self.createLangObject = function() {
		var kom = {};
		for (var field in self.model) {
			var item = self.model[field];
			kom[field] = item.message;
		}
		self.koModel = kom;
	};
	
	// Gets a field value regardless of being an observable or not.
	// If not passed a field, it will return an object with all values
	self.get = function(field) {
		if (!field) {
			var data = {};
			for (var field in self.model)
				data[field] = self.get(field);
			return data;
		}
		
		if (ko.isObservable(self.koModel[field]))
			return self.koModel[field]();
		else
			return self.koModel[field];
	};
	
	// Sets a field value regardless of being an observable or not.
	self.set = function(field, value) {
		if (self.get(field) == value)
			return;
		if (ko.isObservable(self.koModel[field]))
			self.koModel[field](value);
		else
			self.koModel[field] = value;
	};
	
	// Resets the data in the model to their default values. Does not affect
	// data in the localStorage or chrome.storage
	self.reset = function(field) {
		if (field)
			self.set(field, self.model[field].default);
		else {
			for (var field in self.model)
				self.set(field, self.model[field].default);
		}
	};
	
	// Saves the data in the model to either localStorage or chrome.storage
	// If field is provided it will save the field by the name passed as string,
	// or the fields in the object defined, otherwise all of them
	self.save = function(field, callback) {
			
		var saveData;
		if (typeof(field) == 'string') {
			saveData = {}
			saveData[field] = self.get(field);
		} else if (typeof(field) == 'object') {
			saveData = field;
		}
		else {
			saveData = self.get();
		}
		
		if (self.chromeStorage)
			chrome.storage.sync.set(saveData, callback);
		else {
			for (var field in saveData)
				var v = saveData[field];
				if (typeof(v) != 'string')
					v = JSON.stringify(v);
				localStorage.setItem(field, v);
			if (callback) callback();
		}
	};
	
	// Loads the data into the model from either localStorage or chrome.storage
	// If field is provided it will only do the one, otherwise all of them
	self.load = function(field, callback) {
		var loadData = [];
		if (field)
			loadData.push(field);
		else {
			for (var field in self.model)
				loadData.push(field);
		}
		
		if (self.chromeStorage)
			chrome.storage.sync.get(loadData, function(e) {
				console.log(e);
				for (var field in e)
					self.set(field, e[field]);
					if (callback) callback();
			});
		else {
			for (var i in loadData) {
				var field = loadData[i];
				var v = localStorage.getItem(field);
				var f = self.model[field];
				if (typeof (f.default) != 'string')
					v = JSON.parse(v);
				self.set(field, v);
			}
			if (callback) callback();
		}
	};
	
	// After being created. This function should be called to start the event
	// handlers. It should not be called for i18n models.
	self.startListening = function() {
		if (typeof(chrome) == 'undefined' || typeof(chrome.runtime) == 'undefined')
			return;
		
		chrome.runtime.onMessage.addListener(function(e) {
			if ('option_update' in e) {
				for (var field in e.option_update) {
					var value = e.option_update[field];
					var current = self.koModel[field];
					if (ko.isObservable(current)) {
						current.dontSendMessage = true;
						current(value);
						current.dontSendMessage = false;
					} else {
						self.set(field, value);
					}
				}
			}
		});
		for (var field in self.model) {
			if (ko.isObservable(self.koModel[field])) {
				(function(field) { // Allows field to be unique for each handler.
					self.koModel[field].subscribe(function() {
						// If a message is the one setting it, don't send it again.
						if (self.koModel[field].dontSendMessage)
						{
							return;
						}
						
						var d = { option_update: {} };
						d.option_update[field] = self.get(field);
						if (self.autosave) {
							if (self.koModel[field].delayId) {
								clearTimeout(self.koModel[field].delayId);
								self.koModel[field].delayId = 0;
							}
							if (self.koModel[field].saveDelay)
							{
								self.koModel[field].delayId = setTimeout(function() {
									self.save(d.option_update);
								}, self.koModel[field].saveDelay);
							} else {
								self.save(d.option_update);							
							}
						}
						
						chrome.runtime.sendMessage(d);
					});
				})(field);
			}
		}
	};
	
	if (model)
		self.createKOObject();
};
