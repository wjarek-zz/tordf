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

var request = require("request");
var ExtractStream = require("./extractstream").ExtractStream;
var RdfStream = require("./rdfstream").RdfStream;

var tordf = function (url) {
	var opts = { objectMode: true, 
				 blankNodeBase: url }; 
	var extractstream = new ExtractStream(opts);
	var rdfstream = new RdfStream(opts);

	var stream = request(url)
			.pipe(extractstream)
			.pipe(rdfstream);	
	return stream; 
}

exports = module.exports = tordf;
