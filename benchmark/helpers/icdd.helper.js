const IcddParser = require('../../utils/icdd.parser.js');
const path = require('path');

const fs = require('fs');

const config = {
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

const parseIcdd = async (src) => {
  const BoQFile = path.join(__dirname, `/..${src}/${config.boqName}.xml`);
  const BillingFile = path.join(
    __dirname,
    `/..${src}/${config.billingName}.xml`
  );
  const billing = await readFile(BillingFile).then((json) =>
    IcddParser.parseBillingFile(json, false)
  );
  const boqs = await readFile(BoQFile).then((json) =>
    IcddParser.parseBoQFiles([json], billing, false)
  );
  return { billing, boqs };
};

module.exports = parseIcdd;
