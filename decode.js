const crypto = require('crypto');
const fs = require('fs');
const Busboy = require('busboy');
const path = require('path')
var http = require('http');
const mysql = require('mysql');


const decrypt = 'D:/kanishka/decrypted/';
const decryptTmp = 'D:/kanishka/dm-tool/uploads/';
const connection = mysql.createConnection({
  host     : 'localhost',
  port     :  '3306',
  user     : 'root',
  password : '',
  database : 'kanishka'
});
var tier1Key=''
var tier2Key=''
var tier3Key=''
var tier4Key=''
var Emp_username=''
var Emp_password=''

try{
    connection.query('SELECT * from `keys`;', function (error, results) {
    if (error) throw error;
    tier1Key = results[0].key
    tier2Key = results[1].key
    tier3Key = results[2].key
    tier4Key = results[3].key
    });
}catch(e){
console.log(e)
}

//express server to decrypt file
http.createServer(function(req, res) {
    if (req.method === 'POST') {
      var busboy = new Busboy({ headers: req.headers });

      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

        let log =Authenticate()
        log.then((result)=>{
            if(result){
                console.log('Authentication Success '+result)
                    try{

                        if(result == 1){
                            file.pipe(fs.createWriteStream(decryptTmp+path.basename(filename)));
                            let val =decryptAndUpload(filename,tier1Key)
                            val.then(()=>{
                            fs.unlink(decryptTmp+path.basename(filename), function (err) {
                                if (err) throw err;
                                console.log('Decrypted successfully');
                            });
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        }
                        else if(result == 2){
                            file.pipe(fs.createWriteStream(decryptTmp+path.basename(filename)));
                            let val =decryptAndUpload(filename,tier2Key)
                            val.then(()=>{
                            fs.unlink(decryptTmp+path.basename(filename), function (err) {
                                if (err) throw err;
                                console.log('Decrypted successfully');
                            });
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        }
                        else if(result == 3){
                            file.pipe(fs.createWriteStream(decryptTmp+path.basename(filename)));
                            let val =decryptAndUpload(filename,tier3Key)
                            val.then(()=>{
                            fs.unlink(decryptTmp+path.basename(filename), function (err) {
                                if (err) throw err;
                                console.log('Decrypted successfully');
                            });
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        }
                        else if(result == 4){
                            file.pipe(fs.createWriteStream(decryptTmp+path.basename(filename)));
                            let val =decryptAndUpload(filename,tier4Key)
                            val.then(()=>{
                            fs.unlink(decryptTmp+path.basename(filename), function (err) {
                                if (err) throw err;
                                console.log('Decrypted successfully');
                            });
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        }
                    }catch(e){
                        console.log(e)
                    }
            }
            else{
                console.log('Authentication failed !!')
            }
        })
        .catch(function (error) {
            console.log(error);
        });
      });
      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        if(fieldname === 'username'){
            Emp_username = val;
        }
        else if(fieldname === 'password'){
            Emp_password = val;
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

const decryptAndUpload = (filename,key) => {
  return new Promise((resolve, reject) => {
      try{
        const deCipher = crypto.createDecipher('aes-256-cbc',key);
        let decName = decrypt+path.basename(filename).replace('.enc','')
        fs.createReadStream(decryptTmp+path.basename(filename)).pipe(deCipher).pipe(fs.createWriteStream(decName));  
        resolve()
      }catch(e){
          console.log(e);
          reject(e);
      }
  })
};

const Authenticate = () => {
    return new Promise((resolve, reject) => {
        try{
            connection.query('SELECT tier FROM `users` WHERE `name` = ? and `password` = ?',[Emp_username,Emp_password], function (error, results) {
                if (error) throw error;
                if(results.length > 0){
                    resolve(results[0].tier)
                }
                else{
                    resolve(false)
                }
                });

        }catch(e){
            console.log(e);
            reject(e);
        }
    })
  };

