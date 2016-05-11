#!/bin/bash

commitId=$(git log --oneline | head -n 1)
git checkout gh-pages
git reset --hard origin/master

git rm package.json
git rm app.js
mv public/* ./
git rm -r public
git add .
git commit -m "$commitId"
