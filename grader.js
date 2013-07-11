#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var res = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var processURL = function(inUrl,checksfile) {
	res.get(inUrl).on('complete',function(result,checksfile) {
		if (result instanceof Error) {
			console.log("Error retrieving URL");
			console.log(Error);
			process.exit(1);
		}
		console.log("url result: " + result);
	});
};

var assertURLExists = function(inURL,checksfile) {
    console.log("begin assertURL fn on " + inURL);
    res.get(inURL).on('complete', function(result,checksfile) {
        if (result instanceof Error) {
            console.log("Error retrieving URL");
            console.log(Error);
            process.exit(1);
        } else {
	    $ = cheerio.load(result);
	    var checks = loadChecks(checksfile).sort();
	    var out = {};
	    for (var ii in checks) {
		var presents = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	    }
	    var outJson = JSON.stringify(out,null,4);
	    console.log(outJson);
            console.log("did we fetch a URL?");
        }
      });
    console.log("exiting assertURL fn");
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var getURLFile = function(inURL) {
	res.get(inURL).on('complete',function(data) {
		program.file = "url.html";
		fs.writeFileSync(program.file,cheerio.load(data));
	});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url [URL]', 'Path to URL (optional; takes precedence over file)')
        .parse(process.argv);


    if (program.url) {
        if( typeof(program.url) != "string") {
	    console.log("error: URL is a "+typeof(program.url)+". URL must be a string.");
	    process.exit(1);
	}
        assertURLExists(program.url,program.checks);
//	processURL(program.url,program.checks);
	console.log("done with assertURLexists");

//        getURLFile(program.url);
//        var checkJson = checkHtmlFile(program.file, program.checks);
//        var outJson = JSON.stringify(checkJson, null, 4);
//        console.log(outJson);
	console.log("URL");
	console.log(program.url);
//        process.exit(1);
    } else if (program.file) {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
//        process.exit(1);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
