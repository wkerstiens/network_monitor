#!/usr/bin/env bash
rm -rf dist/*
tsc
cd dist || return
mkdir sounds
cp ../sounds/* ./sounds/
cp ../package.json ./package.json
rm -rf node_modules
npm install --omit=dev