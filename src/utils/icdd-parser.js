import xml2js from 'xml2js';
import * as _ from 'lodash';
import Web3 from 'web3';

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

// function flatten(tree) {
//   function recurse(nodes, path) {
//     console.log('recurse nodes', nodes);
//     return _.map(nodes.boq_body.boq_ctgy, function (node) {
//       console.log('map node', node);
//       node.id = node.$.id;
//       node.hash = Web3.utils.sha3(node.id);
//       delete node.$;
//       const newPath = _.union(path, [node.name]);
//       const newNode = [
//         _.assign(
//           { pathname: newPath.join(' > '), level: path.length },
//           _.omit(node, 'children')
//         ),
//         recurse(node.children, newPath),
//       ];
//       console.log('new node', newNode);
//       return newNode;
//     });
//   }
//   return _.flattenDeep(recurse(tree.boq_body.boq_ctgy, []));
// }

class BoQ {
  static fromJson(json) {
    const parseCtgy = (ctgy, parent = 0) => {
      ctgy.id = ctgy.$.id;
      ctgy.hash = Web3.utils.sha3(ctgy.id);
      ctgy.parent = parent;
      delete ctgy.$;
      if (!ctgy.boq_body) {
        return ctgy;
      } else {
        if (ctgy.boq_body.boq_ctgy) {
          ctgy.children = ctgy.boq_body.boq_ctgy;
        } else {
          ctgy.children = Array.from(ctgy.boq_body.itemlist.item);
        }
        const newNode = _.omit(ctgy, 'boq_body');
        return _.flattenDeep(
          _.map(newNode.children, (res) => parseCtgy(res, newNode.hash)),
          []
        );
        // ctgy.children.forEach(parseCtgy);
        // return ctgy;
        // if (!ctgy.boq_body.boq_ctgy) {
        //   // special case: second to last in tree has itemlist
        //   const children = Array.from(ctgy.boq_body.itemlist.item).forEach(parseCtgy);
        //   return {...ctgy, children}
        // } else {
        //   return ctgy.boq_body.boq_ctgy.forEach(parseCtgy);
        //   const children = Array.from(ctgy.boq_body.itemlist.item).forEach(parseCtgy);
        //   return {...ctgy, children}
        // }
      }
    };
    const boq = json.gaeb.award.boq;
    console.log('boq', boq);
    const flat = parseCtgy(boq);
    // parseCtgy(boq);
    console.log('boq flat', flat);
    return boq;
  }
}

class BillingModel {
  static fromJson(json) {
    return json;
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
