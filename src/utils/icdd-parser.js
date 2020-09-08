import xml2js from 'xml2js';

// transform all attribute and tag names and values to uppercase
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

class BoQ {
  static fromJson(json) {
    const boq = json.gaeb.award.boq;
    return {
      id: boq.$.id,
      ...boq,
    };
  }
}

class BillingModel {
  static fromJson(json) {
    return json.billing_model.billing_unit.map((u) => ({
      ...u,
      id: u.$.id,
    }));
  }
}

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

  static async parseBillingModelFile(billingModel) {
    const json = await this._parseFromFile(billingModel);
    return BillingModel.fromJson(json);
  }

  static parseBoQFiles(boqs) {
    const parse = async (boq, i) => {
      const json = await this._parseFromFile(boq);
      return BoQ.fromJson(json);
    };
    return Promise.all(boqs.map(parse.bind(this)));
  }
}

export default IcddParser;
