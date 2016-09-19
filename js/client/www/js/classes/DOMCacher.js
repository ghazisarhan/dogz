function DOMCacher()
{
	if (! this instanceof DOMCacher)
		return new DOMCacher();


	this.cachedElements = {};
};


DOMCacher.prototype.get = function(id)
{
	if (this.cachedElements[id] != undefined) {
		return this.cachedElements[id];
	}

	this.cachedElements[id] = $(id);
	return this.cachedElements[id];
}

