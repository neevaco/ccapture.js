#!/bin/bash

uglifyjs ../src/CCapture.js --compress --mangle -o ../build/CCapture.min.js
uglifyjs ../src/download.js ../src/gif.js ../src/CCapture.js --compress --mangle -o ../build/CCapture.all.min.js
