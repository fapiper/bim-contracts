import Web3 from 'web3';

class Assignment {
  constructor(name, service, client, contractor) {
    this.name = name;
    this.service = service;
    this.client = client;
    this.contractor = contractor;
    this.visited = false;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.name + this.created);
  }

  static STATUS = {
    0: { text: 'Nicht vergeben', action: [] },
    1: {
      text: 'Initialisiert',
      color: 'primary',
      textColor: 'white',
      icon: 'flag',
      action: [
        {
          text: 'Auftrag starten',
          method: 'start',
          next: 2,
          type: 'assignment',
        },
      ],
    },
    2: {
      text: 'Gestartet',
      color: 'teal',
      textColor: 'white',
      icon: 'play_arrow',
      action: [
        {
          text: 'Auftrag beenden',
          method: 'finish',
          next: 3,
          type: 'assignment',
        },
      ],
    },
    3: {
      text: 'Beendet',
      color: 'accent',
      textColor: 'white',
      icon: 'stop',
      action: [
        {
          text: 'Auftrag abnehmen',
          method: 'approve',
          next: 4,
          type: 'award',
        },
        {
          text: 'Auftrag ablehnen',
          method: 'reject',
          next: 6,
          type: 'award',
        },
      ],
    },
    4: {
      text: 'Abgenommen',
      color: 'positive',
      textColor: 'white',
      icon: 'done_all',
      action: [],
    },
    5: {
      text: 'Abgenommen & Bezahlt',
      color: 'accent',
      textColor: 'white',
      icon: 'attach_money',
      action: [],
    },
    6: {
      text: 'Abgelehnt',
      color: 'negative',
      textColor: 'white',
      icon: 'block',
      action: [
        {
          text: 'Änderungen bestätigen',
          method: 'finish',
          next: 3,
          type: 'assignment',
        },
      ],
    },
  };
}

export default Assignment;
