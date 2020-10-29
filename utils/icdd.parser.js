const xml2js = require('xml2js');

const BoQ = require('./models/boq.model.js');
const BillingModel = require('./models/billing.model.js');

const nameProcessor = (name) =>
  name
    .match(
      /BoQ|[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
    )
    .map((x) => x.toLowerCase())
    .join('_');

const parserOptions = {
  tagNameProcessors: [nameProcessor],
  attrNameProcessors: [nameProcessor],
  explicitArray: false,
  async: true,
};

class IcddParser {
  static read(file) {
    const reader = new FileReader();
    return new Promise(function (resolve) {
      reader.onload = async () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  }

  static async parseFromFile(file, isBrowser) {
    const raw = isBrowser ? await this.read(file) : file;
    const parser = new xml2js.Parser(parserOptions);
    const parsed = await parser.parseStringPromise(raw);
    return parsed;
  }

  static async parseBillingFile(billingModel, isBrowser = true) {
    const parsed = await this.parseFromFile(billingModel, isBrowser);
    return BillingModel.fromXml(parsed);
  }

  static parseBoQFiles(boqs, billing, isBrowser = true) {
    const parse = async (boq, i) => {
      const parsed = await this.parseFromFile(boq, isBrowser);
      return BoQ.fromGAEB(parsed, billing);
    };
    return Promise.all(boqs.map(parse.bind(this)));
  }

  static async parseFromFiles(billingRaw, boqsRaw) {
    const billing = await this.parseBillingFile(billingRaw);
    const boqs = await this.parseBoQFiles(boqsRaw, billing);
    return { billing, boqs };
  }
}

module.exports = IcddParser;
