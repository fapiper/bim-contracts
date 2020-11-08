const { FlatUtils, FlatNode } = require('../tree.utils.js');

class LinkModel extends FlatUtils {
  constructor(roots, nodes) {
    super();
    this.roots = roots;
    this.nodes = nodes;
  }

  static fromXml(links) {
    console.log('links fromXml', links);
    const builders = {
      'bu_items.item_link.bu_sub_items.item_link': Link.fromItem,
      bu_link: Link.fromSection,
    };
    const { roots, nodes } = super.build(
      links.billing_model_link,
      {},
      { builders, selector: 'id' }
    );
    return new LinkModel(roots, nodes);
  }
}

class Link extends FlatNode {
  constructor(id, link) {
    super();
    this.id = id;
    this.link = link;
  }

  static fromSection(section) {
    const link = new Link(section.bu_items.item_link.bu_item_id, section.bu_id);
    return link;
  }

  static fromItem(item) {
    return new Link(item.bu_item_id, item.bu_item_id);
  }
}

module.exports = LinkModel;
