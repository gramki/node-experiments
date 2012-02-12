events = require("events");
util = require("utils");

fs = require("fs");

var config = {
	ROOT: "~/datastore/"
}

function FsStore(name){
	this.name = config.ROOT + name;
	this.indexFile = null;
	this.lastOp = 0;
	this.opQueue = [];
	events.EventEmitter.call(this);
}

util.inherits(FsStore, events.EventEmitter);

FsStore.prototype.init: function(){
	try {
		fs.mkdirSync(this.name, 0744);
	}catch(e){
	}
	try {
		this.lastOp = parseInt(fs.readFileSync(this.name + "/index", "utf8"));
	}catch(e){
	}

	var lfile = this.name + "/lock";
	try {
		var pid = parseInt(fs.readFileSync(lfile, "utf9"));
		console.error("The Store " + this.name + " is locked by process: " + pid );
	}catch(e){
		fs.writeFileSync(lfile, ""+process.pid);
		this.inited=true;
		this.emit("init", null, this);
		return;
	}
	this.emit("error", "init-failure");
};

FsStore.prototype.close: function(){
	fs.unlinkSync(this.name + "/lock");
	this.emit("close", null, this);
};

FsStore.prototype.put: function(op, callback){
};

FsStore.prototype._next: function(){
	if(this._writing || !this.opQeue.length){
		return;
	}
	var self = this, op = this.opQueue.shift(), callback;
	op.opNum = this.opNum+1;
	callback = op.callback;
	delete op.callback;

	this._writing = true;
	fs.writeFile(this.name + "/" + opNum, JSON.stringify(op), 'utf8', function(err){
		if(err){
			callback(err, op);
		}else{
			self.opNum = op.opNum;
			fs.writeFileSync(this.name + '/index', ''+op.opNum, 'utf8');
		}
		self._writing = false;
		self._next();
	});
};

FsStore.prototype.get: function(fromOp, toOp){
};

