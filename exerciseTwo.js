const https = require('https');
const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

https.get('https://api.welcomesoftware.com/v2/feed/49e82ccda46544ff4e48a5fc3f04e343?format=json', (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        const result = JSON.parse(data);
        const tempData = {};
        result.entries.forEach(article => {
            const title = article.content.title.split(" ");
            title.forEach(word => {
                if (word in tempData) {
                    tempData[word].count += 1;
                    if (tempData[word].guid.findIndex(d => d.guid === article.content.guid) < 0) {
                        tempData[word].guid.push({
                            guid: article.content.guid,
                            title: article.content.title,
                            publish_date: article.content.published_at,
                            creation_date: article.content.created_at,
                            recurrence_count: 0,
                            imageUrl: article.content.images
                        });
                    }
                } else {
                    tempData[word] = {
                        count: 1,
                        guid: [{
                            guid: article.content.guid,
                            title: article.content.title,
                            publish_date: article.content.published_at,
                            creation_date: article.content.created_at,
                            recurrence_count: 0,
                            imageUrl: article.content.images
                        }]
                    };
                }
            });
        });
        
        const arr = Object.entries(tempData);
        const filtered = arr.filter(([key, value]) => value.count > 1);
        const guid = {};
        filtered.forEach(element => {
            element[1].guid.forEach(uid => {
                if (guid[uid.guid]) {
                    guid[uid.guid].recurrence_count += 1;
                } else{
                    guid[uid.guid] = {
                        guid: uid.guid,
                        title: uid.title,
                        publish_date: uid.publish_date,
                        creation_date: uid.creation_date,
                        recurrence_count: 1,
                        imageUrl: uid.imageUrl,
                    };
                }
            });
        });

        const sortable = Object.fromEntries(
            Object.entries(guid).sort(([,a],[,b]) => b.recurrence_count - a.recurrence_count)
        );
        const numArr = []; count = 0; const finalArr = [];
        Object.keys(sortable).forEach(key => {
            if (count < 3) {
                numArr.push(sortable[key].recurrence_count);
                count++;
            } else {
                return;
            }
        });
        Object.keys(sortable).forEach(key => {
            if (numArr.findIndex(d => d === sortable[key].recurrence_count) > -1) {
                let img = '';
                if (sortable[key].imageUrl.length) {
                    sortable[key].imageUrl.forEach(url => {
                        img += url.url+',';
                    });
                }
                finalArr.push({
                    ...sortable[key],
                    imageUrl: img
                });
            }
        });
        const csvFromArrayOfObjects = convertArrayToCSV(finalArr);

        fs.writeFile("data.csv", csvFromArrayOfObjects, "utf-8", (err) => {
            if (err) console.log(err);
            else console.log("Data saved");
          });
    });
}).on("error", (error) => {
    console.log('error: ', error);
});