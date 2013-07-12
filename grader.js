#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

// More on Cheerio here: - http://maxogden.com/scraping-with-node.html
// Is a simple HTML parser that implements a CSS selector API.
// Cheerio is built on top of the htmlparser2 module, a sax-like parser 
// for HTML/XML. The goal of Cheerio is to implement most of the jQuery API 
// in pure JS, without the need for a DOM. There is a separate dependency 
// called cheerio-select that implements the sizzle API. The cheerio module 
// itself more or less implements the jQuery API.
// Using Cheerio
// Since there is no DOM in node you have to initialize a cheerio instance 
// from an HTML string. (this example comes from the cheerio readme)

// var cheerio = require('cheerio'),
    // $ = cheerio.load('<h2 class = "title">Hello world</h2>');// returns a parsed HTML Object

// $('h2.title').text('Hello there!');
// $('h2').addClass('welcome');
// $.html();
// //=> <h2 class = "title welcome">Hello there!</h2>

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));//returns a  parsed HTML Object
};

var loadChecks = function(checksfile) {
// To convert a JSON string into a JavaScript object, 
// you simply pass the JSON string into the 
// JSON.parse() method, like this:

    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();// a js object returned via JSON.parse()
    var out = {};// empty object 
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;  // mark each parsed non-zero length string as true
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else { 
// exports declares checkHtmlFile() callable from outside this file 
// via its assignment to exports.checkHtmlFile.
//   E.g.: In another file1,  var m = require( grader );  //grader.js is this file
// Then, in file1, access function grader.js's checkHtmlFile() via m.checkHtmlFile( ... );
    exports.checkHtmlFile = checkHtmlFile;
}