#!/usr/bin/env node
'use strict';

// Initialize Modules
const fs = require("fs");
const os = require("os");
const puppeteer = require("puppeteer");

async function runPuppeteer () {
  const browser = await puppeteer.launch({dumpio: true});
  const page = await browser.newPage();
  await page.goto("https://www.w3.org/tr/wcag/");
  await page.waitFor(1000);
  let results = await page.evaluate(() => {
    let results = [];
    let successCriteria = document.querySelectorAll("section.sc");
    
    for (sc of successCriteria) {
      let scTitle = sc.querySelector("h4").textContent;
      scTitle = scTitle.substring(scTitle.search(/\d/), scTitle.length - 1).trim();
      let scLevel = sc.querySelector(".conformance-level").textContent;
      scLevel = scLevel.substring(7, scLevel.length - 1).trim();
      let scLink = sc.querySelector(".doclinks > a:nth-child(1)").href; 
      results.push({
        "title": scTitle,
        "level": scLevel,
        "link": scLink
      });
    } // end for.
    
    return results;
  });
  
  await page.close();
  await browser.close();
  
  return results;
} // end runPuppeteer.

runPuppeteer().then((results) => {
  let output = `title,level,link${os.EOL}`;
  for (let item of results) {
    output += `${item.title},${item.level},${item.link}${os.EOL}`;
  } // end for.
  fs.writeFile("sc.csv", output, "utf8", () => {
    console.log("*** sc.csv saved ***");
  });
});


