import Web3 from 'web3';

class Assignment {
  static STATUS = {
    0: { text: 'Nicht vergeben', action: 'Auftrag vergeben' },
    1: {
      text: 'Initialisiert',
      color: 'primary',
      textColor: 'white',
      action: 'Auftrag starten',
    },
    2: {
      text: 'Gestartet',
      color: 'teal',
      textColor: 'white',
      action: 'Auftrag beenden',
    },
    3: {
      text: 'Beendet',
      color: 'dark',
      textColor: 'white',
      action: 'Auftrag abnehmen',
    },
    4: {
      text: 'Abgenommen',
      color: 'accent',
      textColor: 'white',
    },
    5: {
      text: 'Abgelehnt',
      color: 'negative',
      textColor: 'white',
      action: 'Auftrag neu starten',
    },
    6: {
      text: 'Bezahlt',
      color: 'accent',
      textColor: 'white',
    },
  };

  constructor(address, service, client, contractor) {
    this.address = address;
    this.service = service;
    this.client = client;
    this.contractor = contractor;
    this.visited = false;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.address + this.created);
  }
}

export default Assignment;
