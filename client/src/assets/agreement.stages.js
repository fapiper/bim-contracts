export default {
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
        checkForUpdate: (service, parent, siblings) => {
          return parent.stage < 2;
        },
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
        checkForUpdate: (service, parent, siblings) => {
          return siblings.every((s) => s.hash === service.hash || s.stage >= 3);
        },
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
        checkForUpdate: (service, parent, siblings) => {
          return siblings.every((s) => s.hash === service.hash || s.stage >= 4);
        },
      },
      {
        text: 'Auftrag ablehnen',
        method: 'reject',
        next: 2,
        type: 'award',
        checkForUpdate: (service, parent, siblings) => false,
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
    text: 'Abgelehnt',
    color: 'negative',
    textColor: 'white',
    icon: 'block',
    action: [],
  },
};
