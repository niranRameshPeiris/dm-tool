const crypto = require('crypto');
const chokidar = require('chokidar');
const fs = require('fs');
const mysql = require('mysql');

const directory = 'D:/kanishka/tmp';
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

//track and encrypt
var watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

watcher
  .on('add', path => checkName(path))


  function checkName(name)
  {
      if(name.includes("high") || name.includes("mid") || name.includes("low") ){
        //check the employee tier and pass suitable tier key
        let val = FindTier(name)
        val.then((result)=>{
          if(result == 1){
            dmProcess(name,tier1Key);
          }
          if(result == 2){
            dmProcess(name,tier2Key);
          }
          if(result == 3){
            dmProcess(name,tier3Key);
          }
          if(result == 4){
            dmProcess(name,tier4Key);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      }
      else{
        uploadPublic(name)
        console.log("Public file detected")
      }
  }

  function uploadPublic(file)
  {
      let val = uploadFile(file)
      val.then(()=>{
          fs.unlink(file, function (err) {
              if (err) throw err;
              console.log('Uploaded and deleted successfully');
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function dmProcess(file,tier)
  {
      let val = encryptFile(file,tier)
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

  const FindTier = (name) => {
    return new Promise((resolve, reject) => {
        let user = name.split('-')
        console.log(user)
        if(user[1] != null){
            try{
                connection.query('SELECT tier FROM `users` WHERE `name` = ?',[user[1]], function (error, results) {
                    if (error) throw error;
                    resolve(results[0].tier)
                    });
                }catch(e){
                console.log(e)
                reject("Mysql error")
                }
        }
        else{
          reject("No user included in the filename")
        }
    })
  };

  const encryptFile = (file,tier) => {
      return new Promise((resolve, reject) => {
        console.log('key : '+tier);
          try{
              //db to get the key based on user
              const cipher = crypto.createCipher('aes-256-cbc', tier);
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

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        try{
            const input = fs.createReadStream(file);
            const encFileName = file.replace('tmp', 'dir');
            const output = fs.createWriteStream(encFileName);
            input.pipe(output);
            resolve()
        }catch(e){
            console.log(e);
            reject(e);
        }
    })
  };