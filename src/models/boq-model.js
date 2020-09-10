import { flatten } from 'src/utils/tree.js';

/* eslint-disable camelcase */
class BoQ {
  constructor(id, name, label, date, items) {
    this.id = id;
    this.name = name;
    this.label = label;
    this.date = date;
    this.items = items;
  }

  static fromGAEB(boq) {
    const items = flatten(boq.gaeb.award.boq, [], {
      'boq_body.itemlist.item': BoQItem.fromGAEB,
      'boq_body.boq_ctgy': BoQCtgy.fromGAEB,
    });
    const info = boq.gaeb.award.boq.boq_info;
    return new BoQ(
      boq.gaeb.award.boq.$.id,
      info.name,
      info.lbl_boq,
      Date.parse(info.date),
      items
    );
  }
}

class BoQCtgy {
  constructor(id, name, children) {
    this.id = id;
    this.name = name;
    // this.children = children;
  }

  static fromGAEB(ctgy) {
    // TODO move this to icdd parser
    // const children = (ctgy.boq_body
    //   ? ctgy.boq_body.boq_ctgy
    //   : ctgy.itemlist.item
    // ).map((i) => i.$.id);
    return new BoQCtgy(ctgy.$.id, ctgy.lbl_tx.p.span);
  }
}

class BoQItem {
  constructor(id, r_no_part, short_desc, long_desc, qty, qty_unit) {
    this.id = id;
    this.r_no_part = r_no_part;
    this.short_desc = short_desc;
    this.long_desc = long_desc;
    this.qty = qty;
    this.qty_unit = qty_unit;
  }

  static fromGAEB(item) {
    return new BoQItem(
      item.$.id,
      item.$.r_no_part,
      item.description?.outline_text?.outl_txt?.text_outl_txt?.p?.span || '',
      item.description?.complete_text?.detail_text?.text?.p?.span || '',
      item.qty,
      item.qu
    );
  }
}

export default BoQ;
