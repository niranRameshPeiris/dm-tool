const crypto = require('crypto');
const chokidar = require('chokidar');
const fs = require('fs');
const express = require('express')
const Busboy = require('busboy');
const path = require('path')
const os = require('os')
var http = require('http');

const directory = 'D:/kanishka/tmp';
const decrypt = 'D:/kanishka/decrypted/';
const decryptTmp = 'D:/kanishka/dm-tool/uploads/';

//track and encrypt
var watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

watcher
  .on('add', path => checkName(path))

//express server to decrypt file
http.createServer(function(req, res) {
    if (req.method === 'POST') {
      var busboy = new Busboy({ headers: req.headers });
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        try{
            file.pipe(fs.createWriteStream(decryptTmp+path.basename(filename)));
            const deCipher = crypto.createDecipher('aes-256-cbc', 'key00001');
            let decName = decrypt+path.basename(filename).replace('.enc','')
            console.log(decName);
            fs.createReadStream(decryptTmp+path.basename(filename)).pipe(deCipher).pipe(fs.createWriteStream(decName));
        }catch(e){
            console.log(e)
        }
      });
      busboy.on('finish', function() {
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
      });
      return req.pipe(busboy);
    }
    res.writeHead(404);
    res.end();
  }).listen(8000, function() {
    console.log('Listening for requests');
  });


function checkName(name)
{
    if(name.includes("high") || name.includes("mid") || name.includes("low") ){
        dmProcess(name);
    }
    else{
        console.log("public")
    }
}

function dmProcess(file)
{
    let val = encryptFile(file)
    val.then(()=>{
        fs.unlink(file, function (err) {
            if (err) throw err;
            console.log('Encrypted and deleted successfully');
        });
    })
    .catch(function (error) {
      console.log(error);
    });
}

const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
        tier01Key = "key00001"
        tier02Key = "key00002"
        tier03Key = "key00003"
        tier04Key = "key00004"
        try{
            //db to get the key based on user
            const cipher = crypto.createCipher('aes-256-cbc', tier01Key);
            const input = fs.createReadStream(file);
            const encFileName = file.replace('tmp', 'dir');
            console.log(encFileName)
            const output = fs.createWriteStream(encFileName+'.enc');
            input.pipe(cipher).pipe(output);
            resolve()
        }catch(e){
            console.log(e);
            reject(e);
        }
    })
};