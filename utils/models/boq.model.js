const { TreeUtils, FlatNode } = require('../tree.utils.js');
const Web3 = require('web3');

class BoQModel {
  constructor(id, name, label, date, roots, nodes) {
    this.id = id;
    this.name = name;
    this.label = label;
    this.date = date;
    this.roots = roots;
    this.nodes = nodes;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.id + this.created);
  }

  static fromGAEB(boq, { billing, links }) {
    const builders = {
      'boq_body.itemlist.item': BoQItem.fromGAEB,
      'boq_body.boq_ctgy': BoQCtgy.fromGAEB,
    };

    const { roots, nodes } = TreeUtils.flat(
      boq.gaeb.award.boq,
      {},
      { builders, billing, links }
    );
    const info = boq.gaeb.award.boq.boq_info;
    return new BoQModel(
      boq.gaeb.award.boq.$.id,
      info.name,
      info.lbl_boq,
      new Date(info.date).toJSON(),
      roots,
      nodes
    );
  }
}

class BoQCtgy extends FlatNode {
  constructor(id, r_no_part, name) {
    super();
    this.id = id;
    this.r_no_part = r_no_part;
    this.name = name;
    this.hash = Web3.utils.sha3(id + new Date().toJSON());
    this.billing_item = null;
  }

  static fromGAEB(ctgy) {
    return new BoQCtgy(ctgy.$.id, ctgy.$.r_no_part, ctgy.lbl_tx.p.span);
  }
}

class BoQItem extends FlatNode {
  constructor(id, r_no_part, short_desc, long_desc, qty, qty_unit) {
    super();
    this.id = id;
    this.r_no_part = r_no_part;
    this.short_desc = short_desc;
    this.long_desc = long_desc;
    this.qty = qty;
    this.qty_unit = qty_unit;
    this.hash = Web3.utils.sha3(id + new Date().toJSON());
    this.billing_item = null;
  }

  static fromGAEB(item) {
    const short_desc = (
      (
        ((((item || {}).description || {}).outline_text || {}).outl_txt || {})
          .text_outl_txt || {}
      ).p || {}
    ).span;
    const long_desc = (
      (
        (
          (((item || {}).description || {}).complete_text || {}).detail_text ||
          {}
        ).text || {}
      ).p || {}
    ).span;

    return new BoQItem(
      item.$.id,
      item.$.r_no_part,
      short_desc,
      long_desc,
      item.qty,
      item.qu
    );
  }
}

module.exports = BoQModel;
