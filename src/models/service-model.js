class ServiceNode {
  constructor(
    id,
    hash,
    parent,
    children,
    name,
    short_description,
    long_description,
    quantities,
    price,
    currency
  ) {}

  static fromBoQCtgy(ctgy, parent) {
    const id = ctgy.$.id;
    const hash = Web3.utils.sha3(ctgy.$.id);
    const children = ctgy.boq_body.boq_ctgy.map((node) => node.$.id);
    const name = ctgy.lbl_tx.p.span;
    return new Service(
      id,
      hash,
      parent,
      children,
      ctgy.lbl_tx.p.span,
      name,
      name,
      name,
      ctgy.totals.total
    );
  }
}
