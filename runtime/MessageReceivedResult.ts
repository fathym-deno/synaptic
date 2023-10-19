export type MessageReceivedResult = {
  Data: string | Blob | ArrayBufferView | ArrayBufferLike;

  Details?: (string | Blob | ArrayBufferView | ArrayBufferLike)[];

  Type: string;
};
