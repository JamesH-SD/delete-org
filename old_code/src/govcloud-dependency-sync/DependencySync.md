# Dependency Sync Between Lambda Directory Package.json Files, and Root Level Package.json

## Overview

This script is used to compare the dependencies that are installed in each respective lambda directory's package.json file, and the root level package.json file. If there are any differences, the script will update the root level package.json file with the dependencies that are installed in the lambda directory's package.json file.