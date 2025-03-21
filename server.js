const express = require('express');    //Express Web Server
const path = require('path');     //used for file path
const fs = require('fs-extra');       //File System - for file manipulation
const uuid = require('uuid');
const exec = require('child_process').exec;
const Busboy = require('busboy');
const PORT = process.env.port || 9021;

const app = express();

app.get('/', function (req, res) {
    let home = __dirname + "/home.html";
    fs.statSync(home);
    const readStream = fs.createReadStream(home);
    let html = "";

    readStream.on('data', function (chunk) {
        html += chunk.toString().replace("@PORT", PORT);
    });

    readStream.on('end', function () {
        res.status(200).send(html);
    });
});


/* ==========================================================
Create a Route (/watermark) to handle the upload
(handle POST requests to /upload)
Express v4  Route definition
============================================================ */
app.route('/watermark')
    .post(function (req, res, next) {
        const busboy = Busboy({headers: req.headers});
        let fstream;
        let watermark, pdftowatermark = '';

        // create temporary directory
        const tempdir = '/tmp/' + uuid.v4()
        fs.mkdirs(tempdir, err => {
            if (err) console.error('Error creating directory:', err);
        });

        let filesUploaded = 0;
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

            let localpath = tempdir + "/" + fieldname + '.pdf';
            fstream = fs.createWriteStream(localpath);
            file.pipe(fstream);

            fstream.on('close', function () {
                filesUploaded++;
                console.log('Uploaded File: ' + filename);

                if (fieldname === "pdf-to-watermark") pdftowatermark = localpath;
                if (fieldname === "watermark") watermark = localpath;

                if (filesUploaded === 2 && (watermark === undefined || pdftowatermark === undefined)) {
                    res.status(500);
                    res.send("Two files uploaded but the file upload fields did not have the right names, did you name the fields watermark and pdf-to-watermark?\n");
                    return;
                }

                if (!watermark || !pdftowatermark) return;

                let output_pdf = tempdir + '/output.pdf';

                let cmd = "pdftk " + pdftowatermark + " multistamp " + watermark + " output " + output_pdf;
                console.log('Running Command: ' + filename);
                res.setHeader('Cmd', cmd);

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        console.error("Error Processing: " + output_pdf);
                        console.error(error);
                        res.status(500);
                        res.send('Could not convert PDF');
                        return;
                    }


                    let stat = fs.statSync(output_pdf);
                    console.error("File Saved and Streaming: " + output_pdf);
                    res.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Length': stat.size
                    });

                    const readStream = fs.createReadStream(output_pdf);
                    readStream.pipe(res);

                    exec('rm -rf ' + tempdir, (err, stdout, stderr) => {
                        if (err) {
                            console.error("Could not delete " + tempdir);
                            return;
                        }

                        console.log("Deleted " + tempdir);
                    });
                });
            });
        });

        req.pipe(busboy);
    });

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
