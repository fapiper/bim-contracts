/* eslint-disable camelcase */
import { FlatTree, FlatNode } from 'src/utils/flat-tree.js';
import Web3 from 'web3';

class BillingModel extends FlatTree {
  constructor(currency, items) {
    super();
    this.currency = currency;
    this.items = items;
    this.hash = Web3.utils.sha3(JSON.stringify(this));
    this.project_hash = null;
    this.created = new Date().toJSON();
  }

  assignProject(project) {
    this.project_hash = project.hash;
  }

  static fromXml(billing) {
    const builders = {
      billing_unit: BillingUnit.fromXml,
      'items.item': BillingItem.fromXml,
      'sub_items.item': BillingItem.fromXml,
    };
    const items = super.build(billing.billing_model, {}, { builders });
    return new BillingModel(billing.billing_model.bm_info.currency, items);
  }
}

class BillingUnit extends FlatNode {
  constructor(
    id,
    short_description,
    long_description,
    total_quantities,
    unit,
    total_price,
    completion_date
  ) {
    super();
    this.id = id;
    this.short_description = short_description;
    this.long_description = long_description;
    this.total_quantities = total_quantities;
    this.unit = unit;
    this.total_price = total_price;
    this.completion_date = completion_date;
    this.hash = Web3.utils.sha3(id);
  }

  static fromXml(unit) {
    return new BillingUnit(
      unit.$.id,
      unit.short_description.span,
      unit.long_description.span,
      unit.total_quantities,
      unit.unit,
      unit.total_price,
      unit.completion_date
    );
  }
}

class BillingItem extends FlatNode {
  constructor(id, qty, qty_unit, price, r_no_part_qty_split, short_desc) {
    super();
    this.id = id;
    this.qty = qty;
    this.qty_unit = qty_unit;
    this.price = price;
    this.r_no_part_qty_split = r_no_part_qty_split;
    this.short_desc = short_desc;
    this.hash = Web3.utils.sha3(id);
  }

  static fromXml(item) {
    return new BillingItem(
      item.$.id,
      item.quantities,
      item.unit,
      item.price,
      item.r_no_part_qty_split,
      item.short_des_linked_ifc
    );
  }
}

export default BillingModel;
