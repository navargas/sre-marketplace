#!/bin/bash

set -x

commitId=$(git log --oneline | head -n 1)
git checkout gh-pages

rm -rf res/
rm -f index.html

git reset --hard master

git rm package.json
git rm app.js
mv public/* ./
git rm -r public
git add .
git commit -m "$commitId"
