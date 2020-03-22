parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"SzAG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.language=exports.conf=void 0;var e={brackets:[["{","}"],["[","]"],["(",")"]],autoClosingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}],surroundingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}]};exports.conf=e;var t={tokenPostfix:".tcl",specialFunctions:["set","unset","rename","variable","proc","coroutine","foreach","incr","append","lappend","linsert","lreplace"],mainFunctions:["if","then","elseif","else","case","switch","while","for","break","continue","return","package","namespace","catch","exit","eval","expr","uplevel","upvar"],builtinFunctions:["file","info","concat","join","lindex","list","llength","lrange","lsearch","lsort","split","array","parray","binary","format","regexp","regsub","scan","string","subst","dict","cd","clock","exec","glob","pid","pwd","close","eof","fblocked","fconfigure","fcopy","fileevent","flush","gets","open","puts","read","seek","socket","tell","interp","after","auto_execok","auto_load","auto_mkindex","auto_reset","bgerror","error","global","history","load","source","time","trace","unknown","unset","update","vwait","winfo","wm","bind","event","pack","place","grid","font","bell","clipboard","destroy","focus","grab","lower","option","raise","selection","send","tk","tkwait","tk_bisque","tk_focusNext","tk_focusPrev","tk_focusFollowsMouse","tk_popup","tk_setPalette"],symbols:/[=><!~?:&|+\-*\/\^%]+/,brackets:[{open:"(",close:")",token:"delimiter.parenthesis"},{open:"{",close:"}",token:"delimiter.curly"},{open:"[",close:"]",token:"delimiter.square"}],escapes:/\\(?:[abfnrtv\\"'\[\]\{\};\$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,variables:/(?:\$+(?:(?:\:\:?)?[a-zA-Z_]\w*)+)/,tokenizer:{root:[[/[a-zA-Z_]\w*/,{cases:{"@specialFunctions":{token:"keyword.flow",next:"@specialFunc"},"@mainFunctions":"keyword","@builtinFunctions":"variable","@default":"operator.scss"}}],[/\s+\-+(?!\d|\.)\w*|{\*}/,"metatag"],{include:"@whitespace"},[/[{}()\[\]]/,"@brackets"],[/@symbols/,"operator"],[/\$+(?:\:\:)?\{/,{token:"identifier",next:"@nestedVariable"}],[/@variables/,"type.identifier"],[/\.(?!\d|\.)[\w\-]*/,"operator.sql"],[/\d+(\.\d+)?/,"number"],[/\d+/,"number"],[/;/,"delimiter"],[/"/,{token:"string.quote",bracket:"@open",next:"@dstring"}],[/'/,{token:"string.quote",bracket:"@open",next:"@sstring"}]],dstring:[[/\[/,{token:"@brackets",next:"@nestedCall"}],[/\$+(?:\:\:)?\{/,{token:"identifier",next:"@nestedVariable"}],[/@variables/,"type.identifier"],[/[^\\$\[\]"]+/,"string"],[/@escapes/,"string.escape"],[/"/,{token:"string.quote",bracket:"@close",next:"@pop"}]],sstring:[[/\[/,{token:"@brackets",next:"@nestedCall"}],[/\$+(?:\:\:)?\{/,{token:"identifier",next:"@nestedVariable"}],[/@variables/,"type.identifier"],[/[^\\$\[\]']+/,"string"],[/@escapes/,"string.escape"],[/'/,{token:"string.quote",bracket:"@close",next:"@pop"}]],whitespace:[[/[ \t\r\n]+/,"white"],[/#.*\\$/,{token:"comment",next:"@newlineComment"}],[/#.*(?!\\)$/,"comment"]],newlineComment:[[/.*\\$/,"comment"],[/.*(?!\\)$/,{token:"comment",next:"@pop"}]],nestedVariable:[[/[^\{\}\$]+/,"type.identifier"],[/\}/,{token:"identifier",next:"@pop"}]],nestedCall:[[/\[/,{token:"@brackets",next:"@nestedCall"}],[/\]/,{token:"@brackets",next:"@pop"}],{include:"root"}],specialFunc:[[/"/,{token:"string",next:"@dstring"}],[/'/,{token:"string",next:"@sstring"}],[/(?:(?:\:\:?)?[a-zA-Z_]\w*)+/,{token:"type",next:"@pop"}]]}};exports.language=t;
},{}]},{},["SzAG"], null)
//# sourceMappingURL=tcl.890e4fe6.js.map