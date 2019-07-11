const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

var filePath = path.join(__dirname, 'input', 'test1.tsv');

// https://stackoverflow.com/questions/1418050/string-strip-for-javascript
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// split into different lines, i.e., samples
var data = fs.readFileSync(filePath, 'utf8').trim().split("\n");

var processed = [];
var group = [];
var sentence = [];
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

var counter = 0;

function next(req, res) {
  counter++;

  if (counter < processed.length) {
    res.send(group[counter-1] + "\n" + sentence[counter-1] + "\n")
    // res.send(counter + "\n");
  } else {
    res.status(404).send('Exceeded file lines!');
  }
}

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/next', (req, res) => {next(req, res)});

app.get('/dead', (req, res) => res.sendStatus(404));

// Listen
app.listen(3000, () => console.log('Server ready'));
