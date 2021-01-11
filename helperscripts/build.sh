#!/usr/bin/env bash
rm -rf dist
npm install
tsc
cd dist
cp ../package.json ./package.json
rm -rf node_modules
npm install --production