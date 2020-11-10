const BimLvParser = require('../../utils/bim-lv.parser.js');
const path = require('path');

const fs = require('fs');

const config = {
  linkName: 'BMlinks',
  boqName: 'Leistungsverzeichnis',
  billingName: 'BillingModel',
};

const readFile = (file) => {
  return new Promise(function (resolve) {
    fs.readFile(file, 'utf8', (err, res) => {
      if (err) console.error('ERROR parsing icdd file');
      resolve(res);
    });
  });
};

const parseContainer = async (src) => {
  const LinkFile = path.join(__dirname, `/..${src}/${config.linkName}.xml`);
  const BoQFile = path.join(__dirname, `/..${src}/${config.boqName}.xml`);
  const BillingFile = path.join(
    __dirname,
    `/..${src}/${config.billingName}.xml`
  );
  const links = await readFile(LinkFile).then((json) =>
    BimLvParser.parseLinkFile(json, false)
  );
  const billing = await readFile(BillingFile).then((json) =>
    BimLvParser.parseBillingFile(json, false)
  );
  const boq = await readFile(BoQFile).then((json) =>
    BimLvParser.parseBoQFile(json, { billing, links }, false)
  );
  return { billing, boq };
};

module.exports = parseContainer;
