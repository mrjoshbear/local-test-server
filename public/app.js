'use strict';
import Abulafia from "./abulafia.js";
export const abulafia = new Abulafia();

// fetch('./data/general.txt').then(response => response.text()).then(data => abulafia.load(data));

async function fetchAndLoadData(abulafia) {
  const [generalResponse] = await Promise.all([
    fetch('./data/general.txt')
  ]);
  abulafia.load(await generalResponse.text());
}

export function output(text) {
  const newDiv = document.createElement("div");
  newDiv.innerHTML = text;
  document.getElementById("main").prepend(newDiv);
}

export function buildInput(abulafia) {
  const inputList = document.getElementById("inputList");
  for (const tableName of abulafia.getTableNames()) {
    const newElement = document.createElement("li");
    newElement.classList.add("tableNameInput");
    newElement.innerText = tableName;
    newElement.addEventListener("click", function(){output(abulafia.get(tableName))}, false);
    inputList.append(newElement);
  }
}

await fetchAndLoadData(abulafia);
buildInput(abulafia);
