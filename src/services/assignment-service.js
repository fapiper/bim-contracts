import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
import Assignment from 'src/models/assignment-model';
const ServiceAgreementFactoryAddress =
  '0x852543528aF03b706b2785dFd3103898Ed256eaD';

const flatHandle = async (node, handleFn) => {
  const children = await handleFn(node);
  return children.length > 0
    ? Promise.all(
        children.map((child) => flatHandle(child, handleFn))
      ).then((res) => res.flat())
    : node;
};

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
    this.factoryContract = new web3.eth.Contract(
      ServiceAgreementFactoryAbi,
      ServiceAgreementFactoryAddress
    );
  }

  async loadDb(user_address) {
    if (this._assigned !== user_address) {
      const assignmentdb = await this.orbitdb.keyvalue(
        `user.${user_address}.assignments`,
        {
          create: true,
          accessController: {
            write: ['*'],
          },
        }
      );
      // await assignmentdb.load();
      this._assigned = user_address;
      this.assignmentdb = assignmentdb;
      console.log('loaded db from loadDb', this.assignmentdb);
    }
    return this.assignmentdb;
  }

  async assign(project_hash, service, client, contractor) {
    const status = 1;
    // Store assignment in db of contractor
    const assignment = new Assignment(service, client, contractor, status);
    // await this.put(contractor.address, assignment);

    // Update boq item status in project db
    const handleFn = async (node) => {
      const children = await this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      );
      node.status = assignment.status;
      const updated = Promise.all(
        children.map(async (child) => {
          child.status = node.status;
          return child;
        })
      );
      return updated;
    };
    const nodes = await flatHandle(service, handleFn);

    // Store assignment on chain
    // const children = nodes.map((c) => c.hash);
    // const parents = nodes.map((c) => c.parent);
    // const billings = nodes.map((c) => c.billing_item !== null);
    // await this.factoryContract.methods
    //   .createServiceAgreement(
    //     service.hash,
    //     service.parent,
    //     client.address,
    //     contractor.address,
    //     children,
    //     parents,
    //     billings,
    //     []
    //   )
    //   .send({ from: client.address, gas: 2000000 });
    return nodes;
  }

  async put(user_address, assignment) {
    const assignmentdb = this.loadDb(user_address);
    const hash = await assignmentdb.put(assignment);
    return hash;
  }
}

export default AssignmentService;
