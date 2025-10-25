// Reference: https://docs.charachorder.com/SerialAPI.html
export enum SerialCommand {
  Id = 'ID',
  Version = 'VERSION',
  GetChordMapCount = 'CML C0',
  GetChordMapByIndex = 'CML C1',
}

export type SerialCommandArgMap = {
  [SerialCommand.Id]: undefined;
  [SerialCommand.Version]: undefined;
  [SerialCommand.GetChordMapCount]: undefined;
  [SerialCommand.GetChordMapByIndex]: [number];
};
