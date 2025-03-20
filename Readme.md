Docker HTTP Node PDF Watermarker
========================

This is an updated fork of [surebert/docker-pdf-watermarker](https://github.com/surebert/docker-pdf-watermarker) with
security updates, dependency upgrades, and improved Docker support.

This image is service used to stamp one PDF as a watermark on each page of another and to
return the resulting PDF using pdftk.

## Example call from CURL in Bash
This assumes that the docker image was deployed to localhost on port 9021 and that you are in the test directory of this
project where there are two files: one named watermark.pdf and another named my.pdf.

```bash
cd test
curl -F "watermark=@watermark.pdf" -F "pdf-to-watermark=@pdf-to-watermark.pdf" http://localhost:9021/watermark > watermarked.pdf
```

## Example call from CURL in PHP
This assumes that the docker image was deployed to localhost on port 9020 and that you are in the test directory of this
project where there are two files: one named logo.png and another named styles.css. You can simply run the example.php
file in the test directory of this project or use the code below.

```php
<?php
  $ch = curl_init("http://localhost:9021/watermark");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, [
      'watermark' =>  new \CurlFile(__DIR__.'/watermark.pdf','application/pdf','watermark.pdf'),
      'pdf-to-watermark' =>  new \CurlFile(__DIR__.'/pdf-to-watermark.pdf','application/pdf','my.pdf')
  ]);
  $result = curl_exec($ch);
  file_put_contents("watermarked.pdf", $result);
```

# Build and Deploy

If you wanted to build and test this yourself

```bash
docker build --rm -t meteyou/docker-node-pdf-watermarker .

docker run -d \
    --name pdf-watermarker \
    --restart=always \
    -p 9021:9021 \
    meteyou/docker-node-pdf-watermarker
```
