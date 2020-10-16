import xml2js from 'xml2js';
import BoQ from 'src/models/boq-model.js';
import BillingModel from 'src/models/billing-model.js';

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
  static _read(file) {
    const reader = new FileReader();
    return new Promise(function (resolve) {
      reader.onload = async () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  }

  static async _parseFromFile(billingModel) {
    const raw = await this._read(billingModel);
    const parser = new xml2js.Parser(parserOptions);
    return parser.parseStringPromise(raw);
  }

  static async parseBillingFile(billingModel) {
    const parsed = await this._parseFromFile(billingModel);
    return BillingModel.fromXml(parsed);
  }

  static parseBoQFiles(boqs, billing) {
    const parse = async (boq, i) => {
      const parsed = await this._parseFromFile(boq);
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

export default IcddParser;
