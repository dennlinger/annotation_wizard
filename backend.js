const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

let filePath = path.join(__dirname, 'input', 'test1.tsv');

// https://stackoverflow.com/questions/1418050/string-strip-for-javascript
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// split into different lines, i.e., samples
let data = fs.readFileSync(filePath, 'utf8').trim().split("\n");

let processed = [];
let group = [];
let sentence = [];
// skip header (first row):
console.log(data.length)
for (i = 1; i < data.length; i++) {
  // process rows into something legible for groups and sentences
  processed.push(data[i].trim().split("\t"));
  group.push(processed[processed.length - 1][3]);

  sentence.push(processed[processed.length -1][4].split(" ").map(x => x.split("@")[0]));
  // debug
  // console.log(i);
  // console.log(group[group.length -1]);
  // console.log(processed[processed.length -1][4]);
}

let counter = 0;

function next(req, res) {
  counter++;

  if (counter < processed.length) {
    res.json({group: group[counter-1],
              sentence: sentence[counter-1]})
  } else {
    res.status(404).send('Exceeded file lines!');
  }
}

app.get('/next', (req, res) => {next(req, res)});

// Listen
app.listen(3001, () => console.log('Server ready'));
