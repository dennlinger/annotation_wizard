const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const password = require('./secrets.json');

let inputFilePath = path.join(__dirname, 'input', 'test1.tsv');
let outputFilePath = path.join(__dirname, 'output', 'test1.tsv');

// based on https://stackoverflow.com/questions/51660428/elementwise-concatenation-of-string-arrays
const merge = (a, b, del='@') => {return a.map((val, ind) => val + del + b[ind]);}

// a = ['A', 'quick', 'test']
// b = [0, 1, 0]
//
// console.log(merge(a,b))

// https://stackoverflow.com/questions/1418050/string-strip-for-javascript
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// We can read synchronously, since we only do so at the start.
// Split into different lines, i.e., samples.
let data = fs.readFileSync(inputFilePath, 'utf8').trim().split("\n");

// Output on the other hand should be processed by asynchronous stream,
// since we do not quite know how often we access the file.
// See https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201
// for a good answer on the problem.
let stream = fs.createWriteStream(outputFilePath, {flags:'a'});
// TODO: Problematic is the fact that as of yet we don't really close the stream properly.
// According to the post this is not a problem, but still not too nice.

let processed = [];
let group = [];
let sentence = [];

// skip header (first row):
console.log(data.length + " elements in training file.")

for (i = 1; i < data.length; i++) {
  // process rows into something legible for groups and sentences
  processed.push(data[i].trim().split("\t"));
  group.push(processed[processed.length - 1][3]);

  let cleanSentence = '';
  if (processed[processed.length -1][4].startsWith('@0 ')) {
    cleanSentence = processed[processed.length -1][4].substr(3);
  } else if (processed[processed.length -1][4].startsWith('@0')) {
    cleanSentence = processed[processed.length -1][4].substr(2);
  } else {
    cleanSentence = processed[processed.length -1][4];
  }
  
  sentence.push(cleanSentence.split(" ").map(x => x.split("@")[0]));
  // debug
  // console.log(i);
  // console.log(group[group.length -1]);
  // console.log(processed[processed.length -1][4]);
}

let counter = 0;

function next(req, res) {
  console.log("Received request with current index " + counter)
  if (counter <= processed.length) {
    res.json({group: group[counter],
              sentence: sentence[counter]})
  } else {
    res.status(404).send('Exceeded file lines!');
  }
}


function receive(req, res) {
  // Increase counter only if we receive values. That way we send the sample
  // out until we get an annotation for it.
  console.log("Data returned for index " + counter);
  counter++;

  // re-format the response into the input layout
  let annotated_sentence = merge(sentence[counter -1], req.body.annotations).join(' ');
  let processed_line = processed[counter -1];
  processed_line[4] = annotated_sentence;
  stream.write(processed_line.join('\t') + '\n');
  res.status(200).send('Post successful!\n');

}

function skip(req, res) {
  // Just increase the counter, in case a sentence should be skipped.
  counter ++;
  console.log('Sentence ' + counter + ' was skipped.');
  res.status(200).send('Successfully skipped!\n');
}

function download(req, res) {
  console.log('Data download requested.');
  if (req.body.password != password.password) {
    console.log('Wrong password provided!');
    res.status(404).send('Failed to download data!\n');
  } else {
    console.log('Correct password sent.');
    
    res.status(200).send('Success!\n');
  }
}

app.get('/next', (req, res) => {next(req, res)});

app.use(express.json());
app.post('/receive', (req, res) => {receive(req, res)});

app.post('/skip', (req, res) => {skip(req, res)});

app.post('/download', (req, res) => {download(req, res)});

// Listen
app.listen(3001, () => console.log('Server ready'));
