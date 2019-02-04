#!/usr/bin/env node
'use strict';

// Initialize Modules
const fs = require("fs");
const CSVParser = require("json2csv").Parser;
const puppeteer = require("puppeteer");

async function runPuppeteer () {
  const browser = await puppeteer.launch();
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

console.log("Fetching success criteria...");
runPuppeteer().then((results) => {
  const fields = ["title", "level", "link"];
  const parser = new CSVParser({fields});
  const data = parser.parse(results);
  fs.writeFile("sc.csv", data, "utf8", () => {
    console.log("All done!  The results were written to sc.csv");
  });
}); // end runPuppeteer.
