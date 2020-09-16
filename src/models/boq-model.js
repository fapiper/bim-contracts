import { FlatTree, FlatNode } from 'src/utils/flat-tree.js';
import Web3 from 'web3';

class BoQ extends FlatTree {
  constructor(id, name, label, date, items, children) {
    super();
    this.id = id;
    this.name = name;
    this.label = label;
    this.date = date;
    this.items = items;
    this.children = children;
    this.hash = Web3.utils.sha3(id);
    this.project_hash = null;
    this.created = new Date().toJSON();
  }

  assignProject(project) {
    this.project_hash = project.hash;
  }

  static fromGAEB(boq, billing) {
    const builders = {
      'boq_body.itemlist.item': BoQItem.fromGAEB,
      'boq_body.boq_ctgy': BoQCtgy.fromGAEB,
    };

    const { items } = super.build(
      boq.gaeb.award.boq,
      {},
      { builders, billing }
    );
    const hash = Web3.utils.sha3(boq.gaeb.award.boq.$.id + new Date().toJSON());
    return {
      items,
      hash,
    };
  }
}

class BoQCtgy extends FlatNode {
  constructor(id, r_no_part, name) {
    super();
    this.id = id;
    this.r_no_part = r_no_part;
    this.name = name;
    this.hash = Web3.utils.sha3(id);
    this.billing_item = null;
    this.status = 0;
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
    this.hash = Web3.utils.sha3(id);
    this.billing_item = null;
    this.status = 0;
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
