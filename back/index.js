const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn, spawnSync } = require('child_process')
const fs = require('fs');

let trainDir = 'data/train/';
let testDir = 'data/test/';

const deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const rmdirAsync = function(path, callback) {
	fs.readdir(path, function(err, files) {
		if(err) {
			// Pass the error on to callback
			callback(err, []);
			return;
		}
		var wait = files.length,
			count = 0,
			folderDone = function(err) {
			count++;
			// If we cleaned out all the files, continue
			if( count >= wait || err) {
				fs.rmdir(path,callback);
			}
		};
		// Empty directory to bail early
		if(!wait) {
			folderDone();
			return;
		}
		
		// Remove one or more trailing slash to keep from doubling up
		path = path.replace(/\/+$/,"");
		files.forEach(function(file) {
			var curPath = path + "/" + file;
			fs.lstat(curPath, function(err, stats) {
				if( err ) {
					callback(err, []);
					return;
				}
				if( stats.isDirectory() ) {
					rmdirAsync(curPath, folderDone);
				} else {
					fs.unlink(curPath, folderDone);
				}
			});
		});
	});
};

let userInfo = {}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(trainDir+file.originalname)){
        fs.mkdirSync(trainDir+file.originalname);
        userInfo[file.originalname] = 0
      }
      cb(null, trainDir+file.originalname);
      console.log(file)
    },
    filename: function (req, file, cb) {
      userInfo[file.originalname] += 1
      cb(null, userInfo[file.originalname]+".jpeg");
    }
  }),
});

const save = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(testDir)){
        fs.mkdirSync(testDir);
      }
      cb(null, testDir);
      console.log(file)
    },
    filename: function (req, file, cb) {
      cb(null, "test.jpeg");
    }
  }),
});

// Init app
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


// Public Folder
app.use(express.static('./data'));


app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World. I\'m Chan Young');
})



app.post('/register', upload.array('image'), (req, res, next) => {
  const file = req.files
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send({ response: "save complete"})
});


app.get('/build', buildModel);


function buildModel(req, res) {
  let name = ''
  console.log('Now we have a http message with headers but no data yet.');
  req.on('data', chunk => {
    console.log('A chunk of data has arrived: ', chunk);
    name += JSON.parse(chunk).username;
  });
  req.on('end', () => {
    console.log('No more data');
    const align = spawn('python',["./ai/build.py"]); 
  
    align.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    align.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    
    align.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      res.send({ response: "build complete"})
    });
  })
  
}

app.post('/save', save.single('image'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send({ response: "save complete"})
});

app.get('/test', testImage);

function testImage(req, res) {
  let name = ''
  console.log('Now we have a http message with headers but no data yet.');
  req.on('data', chunk => {
    console.log('A chunk of data has arrived: ', chunk);
    name += JSON.parse(chunk).username;
  });
  req.on('end', () => {
    console.log('No more data');
    const stdout = []
    const stderr = []
    const align = spawn('python',["./ai/test.py"]); 
  
    align.stdout.on('data', data => stdout.push(data.toString())) 
    align.stderr.on('data', data => stderr.push(data.toString())) 
    align.on('close', (code) => { 
      if (code !== 0) { 
        const errorMessage = stderr.join('') 
        return reject(errorMessage) 
      }
      const pythonResult = stdout
        // Exploit pythonResult 
      res.send({response: pythonResult})
    })
  })
}



const port = process.env.PORT || 8000;


app.listen(port, () => console.log(`Listening on port ${port}...`))