/*
Copyright 2014 Google Inc. All rights reserved.

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

var stream = require('stream');

var htmlparser = require("htmlparser2");
var assert = require('assert');


function ExtractStream(opts) {
    ExtractStream.super_.call(this, opts);    
    var self = this;
    this.saving = false;
    this.buffer = "";    
    this.parser = new htmlparser.Parser({
        onopentag: function(name, attribs){     
            if(name === "script" && attribs.type === "application/ld+json"){
                assert(!self.saving);            
                self.saving = true;
            }
        },
        ontext: function(text){     
            if (self.saving) {         
                self.buffer+=text;
            }
        },
        onclosetag: function(tagname){
            if(tagname === "script"){            
                self.saving = false;
                self.push(self.buffer);
                self.buffer="";
            }
        }
    });
};

require("util").inherits(ExtractStream, stream.Transform);

ExtractStream.prototype._transform = function (chunk, encoding, done) {
	this.parser.write(chunk, encoding);	
	done();
}

ExtractStream.prototype._flush = function (done) {
  this.parser.end();
  done();
}

module.exports.ExtractStream = ExtractStream;

