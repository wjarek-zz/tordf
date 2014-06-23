/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var jsonld = require("jsonld");
var assert = require('assert');
var stream = require('stream');
var request = require('request');
var crypto = require('crypto');

/*
 * @param opts 
 *          [blankNodeBase] used to rewrite blank nodes if set				
 */
function RdfStream(opts) {
	RdfStream.super_.call(this, opts);
	this.blankNodeBase = opts.blankNodeBase || ""; 
}

function hash(str) {	
	return str ? crypto.createHash('md5').update(str).digest('hex') : null;
}

require("util").inherits(RdfStream, stream.Transform);

RdfStream.prototype._transform = function (chunk, encoding, done) {
    var docStr = chunk.toString();    
    var doc = JSON.parse(docStr); 
    var opts = {format: "application/nquads"};
    var self = this;
    // if @id present, use it for blank node rewriting     
    // this helps with the case of multiple documents on the same page 
    var blankNodeBase = doc["@id"] || this.blankNodeBase; 
    var blankNodeBaseHash = hash(blankNodeBase); 
	jsonld.toRDF(doc, opts, 
        function(err, nquads) {                	
        		self.push(blankNodeBaseHash ? 
        			self._rewriteBlankNodes(nquads, blankNodeBaseHash) : nquads );		
	      	done();
    });
}


RdfStream.prototype._rewriteBlankNodes = function(nquads, blankNodeBase) {
	return nquads.replace(/_:/g, "_:" + blankNodeBase + ":");
}

RdfStream.prototype._flush = function (done) {  
  done();
}

module.exports.RdfStream = RdfStream;