const fs = require('fs');
const http = require('http');
const url = require('url'); // to implement routing
const slugify = require('slugify'); // importing the 3rd party modules
const replaceTemplateExtjs = require('./modules/replaceTemplate'); // importing objecys from local project folder

const replaceTemplate = (temp, product) => {
    // external function to replace the place holders of the HTML file.
    // html file is passed as "temp" here.
    // "product" holds the values of the JSON file referred via map (one by one)
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);

    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

    return output;
}

// below will executed only once,when started, hence sync works!
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, {lower: true}));
console.log(slugs);

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

// slugify demo
console.log(slugify('Slugify Demo', {lower: true}));

const server = http.createServer((req, res) => {
    //console.log(req.url);
    //console.log(url.parse(req.url, true));

    const {query, pathname} = url.parse(req.url, true); // "url.parse" returns an object, var query & pathname are 2 attributes, need to be exact
    //const pathname = req.url;

    if (pathname=== '/'){
        res.end('Hello from the Server! (default)');
    }
    else if (pathname=== '/overview'){
        //res.end('Hello from the Server. This is overview!');
        console.log('Hello from the Server. This is overview!')
        res.writeHead(200, {'Content-type': 'text/html'});

        // html file "template-card.html" is passed as "tempCard"
        // each value in the json file "dataObj" are sent to ext. function "replaceTemplate" one by one (via map())
        //const cardsHtml = dataObj.map(el => replaceTemplate(tempCard,el)).join(''); // internal
        const cardsHtml = dataObj.map(el => replaceTemplateExtjs(tempCard,el)).join(''); // external
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        
        //console.log(cardsHtml);
        //res.end(tempOverview);

        res.end(output);

    } else if(pathname === '/product'){
        console.log('Hello from the Server. This is produt!');
        res.writeHead(200, {'Content-type': 'text/html'});
        const product = dataObj[query.id];
        //const output = replaceTemplate(tempProduct,product);
        const output = replaceTemplateExtjs(tempProduct,product);
        res.end(output);

    } else if(pathname === '/api'){
        res.writeHead(200, {'Content-type': 'application/json'}); // now, "data" is a json object hence the content type set-up
        res.end(data); // why cannot "dataObj" be shown?

        //fs.readFile('./dev-data/data.json'); // one-way of reading the file from assuming the root
        
        /* since this way of reading the file, is inside the "createServer", everytime a request is made from browser,
             .....  file will be read multiple times, hence this section (only) will be called before. (like a one-time procedure)
        fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
            // above, "dirname" refers to the folder in which this file exists
            const productData = JSON.parse(data);
                //console.log(productData);  res.end('API');
            res.writeHead(200, {'Content-type': 'application/json'}); // now, "data" is a json object hence the content type set-up
            res.end(data);
        }); */
    }else {
        /*res.writeHead(404);
        res.end('Page not found!');*/

        // below allow, html based formatting & actions to be implemented
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not found!</h1>');       
    }

});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000');
});

// call in as "http://127.0.0.1:8000/" from a browser