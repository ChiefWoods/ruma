/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ruma.json`.
 */
export type Ruma = {
  address: 'RUMA3n7Uigup7oprRMKEExme1g5mkcNik7FX6TJphYF';
  metadata: {
    name: 'ruma';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'checkIn';
      discriminator: [209, 253, 4, 217, 250, 241, 207, 50];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
          relations: ['organizer'];
        },
        {
          name: 'asset';
          writable: true;
          signer: true;
        },
        {
          name: 'organizer';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114];
              },
              {
                kind: 'account';
                path: 'authority';
              },
            ];
          };
          relations: ['event'];
        },
        {
          name: 'user';
          relations: ['ticket'];
        },
        {
          name: 'event';
          relations: ['ticket'];
        },
        {
          name: 'ticket';
          writable: true;
        },
        {
          name: 'badge';
          writable: true;
          relations: ['event'];
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'mplCoreProgram';
        },
      ];
      args: [];
    },
    {
      name: 'createEvent';
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
          relations: ['user'];
        },
        {
          name: 'collection';
          writable: true;
          signer: true;
        },
        {
          name: 'user';
        },
        {
          name: 'event';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 118, 101, 110, 116];
              },
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'account';
                path: 'collection';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'mplCoreProgram';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'createEventArgs';
            };
          };
        },
      ];
    },
    {
      name: 'createTicket';
      discriminator: [16, 178, 122, 25, 213, 85, 96, 129];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
          relations: ['user'];
        },
        {
          name: 'user';
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'ticket';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 105, 99, 107, 101, 116];
              },
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'account';
                path: 'event';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'createUser';
      discriminator: [108, 227, 130, 130, 252, 109, 75, 218];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'user';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114];
              },
              {
                kind: 'account';
                path: 'authority';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'createUserArgs';
            };
          };
        },
      ];
    },
    {
      name: 'updateTicket';
      discriminator: [177, 170, 60, 118, 217, 184, 131, 241];
      accounts: [
        {
          name: 'authority';
          signer: true;
          relations: ['organizer'];
        },
        {
          name: 'organizer';
          relations: ['event'];
        },
        {
          name: 'event';
          relations: ['ticket'];
        },
        {
          name: 'ticket';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'status';
          type: {
            defined: {
              name: 'ticketStatus';
            };
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'baseCollectionV1';
      discriminator: [5];
    },
    {
      name: 'event';
      discriminator: [125, 192, 125, 158, 9, 115, 152, 233];
    },
    {
      name: 'ticket';
      discriminator: [41, 228, 24, 165, 78, 90, 235, 200];
    },
    {
      name: 'user';
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'invalidUserAuthority';
      msg: 'User authority cannot be default pubkey';
    },
    {
      code: 6001;
      name: 'userNameTooLong';
      msg: 'User name exceeded max length';
    },
    {
      code: 6002;
      name: 'userImageTooLong';
      msg: 'User image exceeded max length';
    },
    {
      code: 6003;
      name: 'invalidEventOrganizer';
      msg: 'Event organizer cannot be default pubkey';
    },
    {
      code: 6004;
      name: 'invalidBadge';
      msg: 'Event badge cannot be default pubkey';
    },
    {
      code: 6005;
      name: 'eventNameTooLong';
      msg: 'Event name exceeded max length';
    },
    {
      code: 6006;
      name: 'eventImageTooLong';
      msg: 'Event image exceeded max length';
    },
    {
      code: 6007;
      name: 'invalidEventTime';
      msg: 'Start time must be before end time';
    },
    {
      code: 6008;
      name: 'eventHasEnded';
      msg: 'Event has already ended';
    },
    {
      code: 6009;
      name: 'invalidTicketUser';
      msg: 'Ticket user cannot be default pubkey';
    },
    {
      code: 6010;
      name: 'invalidTicketEvent';
      msg: 'Ticket event cannot be default pubkey';
    },
    {
      code: 6011;
      name: 'attendeeNotApproved';
      msg: 'Attendee not approved by organizer';
    },
    {
      code: 6012;
      name: 'attendeeAlreadyCheckedIn';
      msg: 'Attendee already checked in';
    },
    {
      code: 6013;
      name: 'attendeeAlreadyApproved';
      msg: 'Attendee already approved';
    },
  ];
  types: [
    {
      name: 'baseCollectionV1';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'key';
            type: {
              defined: {
                name: 'key';
              };
            };
          },
          {
            name: 'updateAuthority';
            type: 'pubkey';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'uri';
            type: 'string';
          },
          {
            name: 'numMinted';
            type: 'u32';
          },
          {
            name: 'currentSize';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'bitmask';
      type: {
        kind: 'struct';
        fields: ['u8'];
      };
    },
    {
      name: 'createEventArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isPublic';
            type: 'bool';
          },
          {
            name: 'approvalRequired';
            type: 'bool';
          },
          {
            name: 'capacity';
            type: {
              option: 'u32';
            };
          },
          {
            name: 'startTimestamp';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'endTimestamp';
            type: 'i64';
          },
          {
            name: 'eventName';
            type: 'string';
          },
          {
            name: 'eventImage';
            type: 'string';
          },
          {
            name: 'badgeName';
            type: 'string';
          },
          {
            name: 'badgeUri';
            type: 'string';
          },
          {
            name: 'location';
            type: {
              option: 'string';
            };
          },
          {
            name: 'about';
            type: {
              option: 'string';
            };
          },
        ];
      };
    },
    {
      name: 'createUserArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'image';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'event';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['Bump used to derive address'];
            type: 'u8';
          },
          {
            name: 'organizer';
            docs: ['Authority of the event'];
            type: 'pubkey';
          },
          {
            name: 'stateFlags';
            docs: ['State flags'];
            type: {
              defined: {
                name: 'bitmask';
              };
            };
          },
          {
            name: 'capacity';
            docs: ['Max amount of attendees'];
            type: {
              option: 'u32';
            };
          },
          {
            name: 'registrations';
            docs: ['Current amount of registrations'];
            type: 'u32';
          },
          {
            name: 'startTimestamp';
            docs: ['Starting time of the event'];
            type: 'i64';
          },
          {
            name: 'endTimestamp';
            docs: ['Ending time of the event'];
            type: 'i64';
          },
          {
            name: 'badge';
            docs: ['NFT awarded to checked-in attendees'];
            type: 'pubkey';
          },
          {
            name: 'name';
            docs: ['Name of the event'];
            type: 'string';
          },
          {
            name: 'image';
            docs: ['Image URI of the event'];
            type: 'string';
          },
          {
            name: 'location';
            docs: ['Location of the event'];
            type: {
              option: 'string';
            };
          },
          {
            name: 'about';
            docs: ['Description of the event'];
            type: {
              option: 'string';
            };
          },
        ];
      };
    },
    {
      name: 'key';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'uninitialized';
          },
          {
            name: 'assetV1';
          },
          {
            name: 'hashedAssetV1';
          },
          {
            name: 'pluginHeaderV1';
          },
          {
            name: 'pluginRegistryV1';
          },
          {
            name: 'collectionV1';
          },
        ];
      };
    },
    {
      name: 'ticket';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['Bump used to derive address'];
            type: 'u8';
          },
          {
            name: 'user';
            docs: ['User that owns this ticket'];
            type: 'pubkey';
          },
          {
            name: 'event';
            docs: ['Event registered'];
            type: 'pubkey';
          },
          {
            name: 'status';
            docs: ['Approval status of the user for the event'];
            type: {
              defined: {
                name: 'ticketStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'ticketStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'pending';
          },
          {
            name: 'approved';
          },
          {
            name: 'checkedIn';
          },
          {
            name: 'rejected';
          },
        ];
      };
    },
    {
      name: 'user';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['Bump used to derive address'];
            type: 'u8';
          },
          {
            name: 'authority';
            docs: ['Authority of the user'];
            type: 'pubkey';
          },
          {
            name: 'name';
            docs: ['Name of the organizer'];
            type: 'string';
          },
          {
            name: 'image';
            docs: ['Image URI of the organizer'];
            type: 'string';
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: 'eventSeed';
      type: 'bytes';
      value: '[101, 118, 101, 110, 116]';
    },
    {
      name: 'maxUserNameLength';
      type: 'u8';
      value: '32';
    },
    {
      name: 'ticketSeed';
      type: 'bytes';
      value: '[116, 105, 99, 107, 101, 116]';
    },
    {
      name: 'userSeed';
      type: 'bytes';
      value: '[117, 115, 101, 114]';
    },
  ];
};
