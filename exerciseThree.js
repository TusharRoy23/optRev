const fs = require('fs');
const excelToJson = require('convert-excel-to-json');

const result = excelToJson({
    sourceFile: 'MappingDocumentExercise.xlsx',
    sheets: ['in']
});

const keyName = Object.keys(result)[0];

const property = result[keyName][0]['A'].split(',');
const arr = [];

for (let index = 1; index < result[keyName].length; index++) {
    const temp = result[keyName][index]['A'].split(',');
    const obj = {};
    for (let i = 0; i < temp.length; i++) {
        if (temp[i]) {
            obj[property[i]] = temp[i]
        }
    }
    arr.push(obj);
}

const jsonValue = JSON.stringify(arr);
fs.writeFile("data.json", jsonValue, "utf-8", (err) => {
    if (err) console.log(err);
    else console.log("Data saved");
});