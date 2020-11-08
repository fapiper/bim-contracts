const xml2js = require('xml2js');

const LinkModel = require('./models/link.model.js');
const BoQModel = require('./models/boq.model.js');
const BillingModel = require('./models/billing.model.js');

const nameProcessor = (name) =>
  name
    .match(
      /BU|BoQ|[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
    )
    .map((x) => x.toLowerCase())
    .join('_');

const parserOptions = {
  tagNameProcessors: [nameProcessor],
  attrNameProcessors: [nameProcessor],
  explicitArray: false,
  async: true,
};

class BimLvParser {
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

  static async parseLinkFile(links, isBrowser = true) {
    const parsed = await this.parseFromFile(links, isBrowser);
    return LinkModel.fromXml(parsed);
  }

  static async parseBillingFile(billing, isBrowser = true) {
    const parsed = await this.parseFromFile(billing, isBrowser);
    return BillingModel.fromXml(parsed);
  }

  static async parseBoQFile(boq, config, isBrowser = true) {
    const parsed = await this.parseFromFile(boq, isBrowser);
    return BoQModel.fromGAEB(parsed, config);
  }

  static async parseFromFiles(linksRaw, boqRaw, billingRaw) {
    const links = await this.parseLinkFile(linksRaw);
    const billing = await this.parseBillingFile(billingRaw);
    const boq = await this.parseBoQFile(boqRaw, { billing, links });
    return { boq, billing };
  }
}

module.exports = BimLvParser;
