export interface FileOrder {
  entity: string;
  ids: number[];
}

export interface FileMetadata {
  type: string;
  sort: number;
  entity: string;
  orderId: number;
}
