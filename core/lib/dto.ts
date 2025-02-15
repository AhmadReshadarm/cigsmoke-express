export interface PaginationDTO<I> {
  rows: I[];
  length: number;
}

export interface ProductPaginationDTO<I> {
  rows: I[];
  length: number;
  parameterGroups?: { [key: string]: string[] };
}

export interface RatingDTO {
  '1'?: number;
  '2'?: number;
  '3'?: number;
  '4'?: number;
  '5'?: number;
  'avg': number;
}
