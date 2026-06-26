@echo off
cd /d "%~dp0"
node site_builder.js
git add .
git commit -m "update site"
git push
pause